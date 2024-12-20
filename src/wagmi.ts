import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { anvil } from './config/chain'

export const config = createConfig({
    chains: [anvil],
    connectors: [
        injected()
    ],
    transports: {
        [anvil.id]: http(`${anvil.rpcUrls.default.http[0]}`),
    },
})
