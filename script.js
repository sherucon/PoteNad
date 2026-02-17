const editor = document.getElementById('editor');
const textarea = document.getElementById("editor");
const placeholder = document.getElementById("placeholder");


async function compress(text) {
    const bytes = new TextEncoder().encode(text);
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buffer = await new Response(cs.readable).arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function decompress(base64) {
    try {
        const b64 = base64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - base64.length % 4) % 4);
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const ds = new DecompressionStream('gzip');
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const buffer = await new Response(ds.readable).arrayBuffer();
        return new TextDecoder().decode(buffer);
    } catch (e) {
        return "";
    }
}

window.addEventListener('load', async () => {
    const hashData = window.location.hash.substring(1);
    if (hashData) {
        editor.value = await decompress(hashData);
    }
    placeholder.style.display = textarea.value.length > 0 ? "none" : "block";
});

editor.addEventListener('input', async () => {
    const text = editor.value;
    if (text.length > 0) {
        const compressed = await compress(text);
        window.history.replaceState(null, null, "#" + compressed);
    } else {
        window.history.replaceState(null, null, window.location.pathname);
    }
    placeholder.style.display = textarea.value.length > 0 ? "none" : "block";
});
