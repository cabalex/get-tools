<script lang="ts">
    import { IconBarcode, IconBarcodeOff, IconUser, IconChevronLeft } from "@tabler/icons-svelte";
    import { makeGETRequest } from "../getStore";
    import { slide } from "svelte/transition";
    import { onDestroy, onMount } from "svelte";
    import * as PDF417 from "pdf417-generator";
    import './ShareFullscreen.css';
    import Loading from "../assets/Loading.svelte";

    let canvasElem: HTMLCanvasElement;
    let interval: number;
    let invalid = false;
    let sessionId: string = "";
    let lightTheme = localStorage.getItem("get-codetheme") === "light" || false;

    interface Options {
        viewBalance: boolean;
        allowRevoking: boolean;
        revoke: null|RevokeOptions;
    }

    interface RevokeOptions {
        condition: "off"|"balance"|"transactions";
        value: number;
        startTime: number;
    }

    let pin = "";
    let deviceId = "";
    let options:null|Options = null;
    async function getSessionId() {
        if (sessionId) {
            // verify without making a new session id every time
            let response = await makeGETRequest("user", "updatePIN", {
                oldPIN: pin,
                newPIN: pin,
                deviceId,
                sessionId
            }, false);

            if (response.response === true) {
                return true;
            } else {
                invalid = true;
                clearInterval(interval);
                return false;
            }
        }


        let params = new URLSearchParams(location.search);
        try {
            let shareCode = atob(params.get("share") || "");
            deviceId = shareCode.slice(0, 16);
            pin = shareCode.slice(16, 20);
            options = {
                viewBalance: shareCode[20] === "1",
                allowRevoking: shareCode[21] === "1",
                revoke: JSON.parse(shareCode.slice(22) || "null")
            };
        } catch {
            try {
                let shareParams = JSON.parse(atob(params.get("share") || ""));
                pin = shareParams.pin;
                deviceId = shareParams.deviceId;
                options = {
                    allowRevoking: true,
                    viewBalance: false,
                    revoke: shareParams.revokeOptions || null
                };
            } catch {
                console.error("Invalid share code.");
                invalid = true;
                clearInterval(interval);
                return false;
            }
        }
        
        if (!pin || !deviceId){
            console.error("No pin or deviceId found in URL.");
            invalid = true;
            clearInterval(interval);
            return false;
        }
        
        let response = await makeGETRequest("authentication", "authenticatePIN", {
            pin,
            deviceId,
            systemCredentials: {
                password: "NOTUSED",
                userName: "get_mobile",
                domain: ""
            }
        }, false);

        if (response.exception) {
            console.error(response.exception);
            invalid = true;
            clearInterval(interval);
            return false;
        }
        sessionId = response.response;
        return true;
    }

    async function revokeCode(bypassCheck=false) {
        if (!bypassCheck && !confirm("Are you sure you want to revoke this code? It'll revoke it for everyone and it cannot be undone.")) return;

        let response = await makeGETRequest("user", "deletePIN", {
            sessionId,
            deviceId
        }, false);

        if (response.response === true) {
            invalid = true;
        } else if (!bypassCheck) {
            alert("Failed to revoke code. Please try again.")
        }
        clearInterval(interval);
    }

    // Hack: Use WebGPU to increase screen brightness for code scanning
    // https://bright-qrcode.glitch.me/
    async function renderAsWebGPU() {
        if (!("gpu" in navigator) || !("GPUTextureUsage" in window) || !canvasElem) {
            console.log("WebGPU not supported, ignoring");
            return;
        }
        const adapter = await (navigator.gpu as any).requestAdapter();
        if (!adapter) {
            console.log("Could not request adapter, ignoring");
            return;
        }
        const device = await adapter.requestDevice();
        const context: any|null = canvasElem.getContext("webgpu");
        const maxBrightness = 3;
        if (!context) return;
        const format = "rgba16float"; 
        context.configure({
            device,
            format,
            usage: (window.GPUTextureUsage as any).RENDER_ATTACHMENT,
            toneMapping: { mode: "extended" },
        });

        // render code
        const code = `
        struct VertexOutput {
        @builtin(position) position : vec4f,
        @location(0) fragUV : vec2f,
        }

        @vertex
        fn vertexMain(@builtin(vertex_index) i : u32) -> VertexOutput {
        const quadPos = array(vec2f(-1, 1), vec2f(-1, -1), vec2f(1, 1), vec2f(1, -1));
        const quadUV = array(vec2f(0, 0), vec2f(0, 1), vec2f(1, 0), vec2f(1, 1));

        var output: VertexOutput;
        output.position = vec4f(quadPos[i], 0, 1);
        output.fragUV = quadUV[i];
        return output;
        }

        @group(0) @binding(0) var mySampler: sampler;
        @group(0) @binding(1) var myTexture: texture_2d<f32>;

        @fragment
        fn fragmentMain(@location(0) fragUV : vec2f) -> @location(0) vec4f {
        return textureSample(myTexture, mySampler, fragUV) * ${maxBrightness};
        }`;

        const module = device.createShaderModule({ code });

        const pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: { module },
            fragment: { module, targets: [{ format }] },
            primitive: { topology: "triangle-strip" },
        });

        const size = [canvasElem.width, canvasElem.height];
        const texture = device.createTexture({
            size,
            format,
            usage:
            (window.GPUTextureUsage as any).COPY_DST |
            (window.GPUTextureUsage as any).RENDER_ATTACHMENT |
            (window.GPUTextureUsage as any).TEXTURE_BINDING,
        });

        device.queue.copyExternalImageToTexture({ source: canvasElem }, { texture }, size);

        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
            { binding: 0, resource: device.createSampler() },
            { binding: 1, resource: texture.createView() },
            ],
        });

        const colorAttachments = [
            {
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            storeOp: "store",
            },
        ];

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({ colorAttachments });
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(4);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
    }

    let generated = false;
    async function generateCode() {
        if (await getSessionId() === false) return;

        let { response } = await makeGETRequest("authentication", "retrievePatronBarcodePayload", {sessionId}, false);
        PDF417.draw(response, canvasElem, 3);
        await renderAsWebGPU();
        generated = true;
    }

    let balance: null|number = null;
    async function generateBalance() {
        if (invalid) return;
        let { response } = await makeGETRequest("commerce", "retrieveAccounts", {sessionId}, false);
        if (response === null) return;
        
        balance = response.accounts
            .filter((account: any) => account.isAccountTenderActive && account.isActive)
            .reduce((acc: number, account: any) => acc + account.balance, 0);
        return balance;
    }

    async function update() {
        await generateCode();
        if (options && (options.viewBalance || (options.revoke && options.revoke.condition === "balance"))) {
            await generateBalance();
            if (options.revoke && options.revoke.condition === "balance" && typeof balance === "number" && balance <= options.revoke.value) {
                revokeCode();
            }
        }
    }

    onMount(async () => {
        await update();
        interval = setInterval(update, 10000);
    })

    onDestroy(() => {
        clearInterval(interval);
    });

    $: {
        if (lightTheme) {
            document.body.classList.add("light");
            localStorage.setItem("get-codetheme", "light");
        } else {
            document.body.classList.remove("light");
            localStorage.setItem("get-codetheme", "dark");
        }
    }
</script>
{#if lightTheme}
<header class="shareOuterHeader">
    <button on:click={() => lightTheme = false}><IconChevronLeft /> Back</button>
    <h2>Scan Card</h2>
</header>
{/if}
<section class="shareClient" class:light={lightTheme}>
    {#if !invalid}
        <div class="shareHeader">
            {#if lightTheme}
            <div style="flex-grow: 1; height: 100%" />
            <IconUser size={128} />
            <div style="flex-grow: 1; height: 100%" />
            {:else}
            <IconBarcode size={256} />
            <h3>Scan below</h3>
            <p>For best results, increase your device's brightness before scanning</p>
            <button class="lightMode" on:click={() => lightTheme = true}>
                Switch theme
            </button>
            <p class="credit">Shared via <a style="color: white" href="https://cabalex.github.io/get-tools">GET Tools</a></p>
            {/if}
        </div>
        <div class="barcode">
            {#if !generated}
                <div class="loading">
                    <Loading />
                </div>
            {/if}
            <canvas bind:this={canvasElem} />
        </div>
        <footer>
            {#if options && options.viewBalance && balance !== null}
                <div class="balance" transition:slide={{axis: 'x', duration: 100}}>${balance.toFixed(2)}</div>
            {/if}
            {#if options && options.allowRevoking}
            <button on:click={() => revokeCode()} class="dangerBtn">I'm done with this code</button>
            {/if}
        </footer>
    {:else}
        <div class="shareHeader">
            <IconBarcodeOff size={256} />
            <h2>Code revoked</h2>
            <h3>Ask the account owner for a new one!</h3>
            <p class="credit">Share your points with <a style="color: white" href="https://cabalex.github.io/get-tools">GET Tools</a></p>
        </div>
    {/if}
</section>