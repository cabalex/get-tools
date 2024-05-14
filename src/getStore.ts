import { writable, get } from "svelte/store";

const ENDPOINT = "https://services.get.cbord.com/GETServices/services/json";

const sessionId = writable<null|string>(null);
export const sharedDevices = writable<Array<{deviceId: string, pin: string}>>(
    JSON.parse(localStorage.getItem("shared-devices") || "[]")
);

export function addSharedDevice(deviceId: string, pin: string) {
    let devices = get(sharedDevices) || [];
    devices.push({deviceId, pin});
    localStorage.setItem("shared-devices", JSON.stringify(devices));
    sharedDevices.set(devices);
}
export function removeSharedDevice(deviceId: string, pin: string) {
    let devices = get(sharedDevices) || [];
    devices = devices.filter(device => device.deviceId !== deviceId && device.pin !== pin);
    localStorage.setItem("shared-devices", JSON.stringify(devices));
    sharedDevices.set(devices);
}

type GETService = "printing" | "ach" | "user" | "student_advantage" | "configuration" |
    "audit" | "menu" | "session" | "authentication" | "userNotification" | "institution" |
    "content" | "rewards" | "ordering" | "merchant" | "commerce" | "notification";

/**
 * Makes a request from the GET API.
 * @param service The service to call requests from, e.g. "authentication", "session".
 * View https://services.get.cbord.com/GETServices/services for details.
 * @param method The method to use, e.g. "calculateDepositFee". 
 * @param params 
 */
export async function makeGETRequest(service: GETService, method: string, params:any={}, includeSessionId=true) {
    let content = { method, params };
    if (includeSessionId) {
        content.params.sessionId = get(sessionId);
    }
    
    let request = await fetch(`${ENDPOINT}/${service}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(content)
    });

    return request.json();
}

async function getToken() {
    if (!localStorage.getItem("get-data")) return;

    let { pin, deviceId } = JSON.parse(localStorage.getItem("get-data") || "{}");

    if (!pin || !deviceId){
        console.error("No pin or deviceId found in local storage.");
        localStorage.removeItem("get-data");
        return;
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
        //localStorage.removeItem("get-data");
        return;
    }
    sessionId.set(response.response);
}
getToken();

export async function logout() {
    if (!localStorage.getItem("get-data")) return;

    let { pin, deviceId } = JSON.parse(localStorage.getItem("get-data") || "{}");

    if (!pin || !deviceId){
        console.error("No pin or deviceId found in local storage.");
        localStorage.removeItem("get-data");
        return;
    }

    let response = await makeGETRequest("user", "deletePIN", {
        deviceId
    });

    if (response.response === true) {
        localStorage.removeItem("get-data");
        localStorage.removeItem("shared-devices");
        window.location.reload();
    } else {
        alert("Couldn't log out.");
    }
}

/**
 * Verify if shared devices were revoked on the other end.
 */
async function verifySharedSessions() {
    let devices = get(sharedDevices) || [];
    for (let device of devices) {
        let response = await makeGETRequest("authentication", "authenticatePIN", {
            pin: device.pin,
            deviceId: device.deviceId,
            systemCredentials: {
                password: "NOTUSED",
                userName: "get_mobile",
                domain: ""
            }
        }, false);

        if (response.exception) {
            removeSharedDevice(device.deviceId, device.pin);
        }
    }
}

verifySharedSessions();
setInterval(verifySharedSessions, 1000 * 10);

export default sessionId;