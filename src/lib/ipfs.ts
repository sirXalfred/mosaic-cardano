const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

export const uploadJSONToIPFS = async (jsonData: Record<string, unknown> | unknown[], name: string): Promise<string> => {
  if (!PINATA_JWT) {
    console.warn('PINATA_JWT is not set.');
    throw new Error("Pinata IPFS env variable not set!")
  }

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name,
      },
      pinataContent: jsonData,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to upload to IPFS: ${res.statusText}`);
  }

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
};

export const uploadFileToIPFS = async (file: File | Blob, name: string): Promise<string> => {
  if (!PINATA_JWT) {
    console.warn('PINATA_JWT is not set.');
    throw new Error("Pinata IPFS env variable not set!")
  }

  const formData = new FormData();
  formData.append('file', file);
  
  const metadata = JSON.stringify({ name });
  formData.append('pinataMetadata', metadata);
  
  const options = JSON.stringify({ cidVersion: 1 });
  formData.append('pinataOptions', options);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload to IPFS: ${res.statusText}`);
  }

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
};

export const resolveIPFSUri = (uri: string): string => {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    return `${PINATA_GATEWAY}/${uri.replace('ipfs://', '')}`;
  }
  return uri;
};
