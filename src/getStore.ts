import { writable, get } from "svelte/store";
import type { Account, Transaction } from "./types";

const ENDPOINT = "https://services.get.cbord.com/GETServices/services/json";

const sessionId = writable<null|string>(null);
export const sharedDevices = writable<Array<{deviceId: string, pin: string}>>(
    JSON.parse(localStorage.getItem("shared-devices") || "[]")
);
export const revokeOptions = writable<null|{condition: "balance"|"transactions", value: number, startTime: number}>(
    JSON.parse(localStorage.getItem("revoke-options") || "null")
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
    let options = get(revokeOptions);
    // check state of conditional revocation
    if (options !== null) {
        switch(options.condition) {
            case "balance": {
                let { response } = await makeGETRequest("commerce", "retrieveAccounts");
                let accounts: Account[] = response.accounts;
                if (accounts.reduce((acc: number, account: Account) => acc + (account.balance || 0), 0) < options.value) {
                    revokeAllCodes();
                    revokeOptions.set(null);
                    localStorage.removeItem("revoke-options");
                }
                break;
            }
            case "transactions": {
                let { response } = await makeGETRequest("commerce", "retrieveTransactionHistoryWithinDateRange", {
                    "paymentSystemType": 0,
                    "queryCriteria": {
                        "maxReturnMostRecent": 1000,
                        "newestDate": null,
                        "oldestDate": new Date(options.startTime).toISOString(),
                        "accountId": null
                    }
                });

                // sometimes the API can return completely irrelevant transactions, so sanity check
                if (response.transactions.filter((x: Transaction) => new Date(x.actualDate).getTime() > options.startTime).length >= options.value) {
                    revokeAllCodes();
                    revokeOptions.set(null);
                    localStorage.removeItem("revoke-options");
                }
                break;
            }
        }
    }


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

export async function revokeSharedDevice(deviceId: string, pin: string) {
    let response = await makeGETRequest("user", "deletePIN", {
        deviceId
    });

    if (response.response === true) {
        removeSharedDevice(deviceId, pin);
    }
}

async function revokeAllCodes() {
    for (let sharedDevice of get(sharedDevices)) {
        await revokeSharedDevice(sharedDevice.deviceId, sharedDevice.pin);
    }
}

verifySharedSessions();
setInterval(verifySharedSessions, 1000 * 10);

export default sessionId;