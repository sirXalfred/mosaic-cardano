import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '@/lib/api-routes';
import { fetchAPI } from '@/services/api';

interface VerifyPaymentPayload {
  txHash: string;
  planType: string;
}

const verifyPaymentFn = async (payload: VerifyPaymentPayload) => {
  return await fetchAPI(API.PAYMENTS.VERIFY, {
    method: 'POST',
    data: payload,
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyPaymentFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authState'] });
    },
  });
};

export const fetchAdaPrice = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
      const data = await res.json();
      return data.cardano.usd;
    } catch (e) {
      console.error('Failed to fetch ADA price', e);
      throw new Error('Could not fetch live ADA price');
    }
  };
