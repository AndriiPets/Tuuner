export function base64ToBuffer(dataUrl) {
  const BASE64_MARKER = ";base64,";
  const base64Index = dataUrl.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  const base64 = dataUrl.substring(base64Index);
  const raw = window.atob(base64);
  const rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

// note: `buffer` arg can be an ArrayBuffer or a Uint8Array
export async function bufferToBase64(buffer) {
  // use a FileReader to generate a base64 data URI:
  const base64url = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(new Blob([buffer]));
  });
  // remove the `data:...;base64,` part from the start
  return base64url.slice(base64url.indexOf(",") + 1);
}
