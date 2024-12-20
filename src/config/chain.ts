import { type Chain } from 'viem'
import { PROXY_URL } from '../../test/constants'

// Get the pool ID for test worker
const pool = Number(process.env.VITEST_POOL_ID ?? 1)

// Local chain configuration for testing
export const anvil: Chain = {
    id: 123,
    name: 'Anvil',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: [`${PROXY_URL}/${pool}`],
        },
        public: {
            http: [`${PROXY_URL}/${pool}`],
        },
    },
} as const
