export function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export function filenameFromContentDisposition(header?: string | null) {
    if (!header) return null;
    // Content-Disposition: attachment; filename="xxx.csv"
    const match = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i.exec(header);
    return decodeURIComponent(match?.[1] || match?.[2] || "");
}