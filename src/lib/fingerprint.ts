export function getDeviceFingerprint(): string {
    const key = "bb_device_fp";
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    // simple pseudo fingerprint (uuid v4-ish)
    const fp = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });

    localStorage.setItem(key, fp);
    return fp;
}
