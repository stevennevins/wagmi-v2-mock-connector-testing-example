import { useState, useEffect } from 'react'
 import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
 import { parseEther, isAddress } from 'viem'

 type Address = `0x${string}` | undefined

 export default function SendEth() {
   const [to, setTo] = useState<Address>(undefined)
   const [amount, setAmount] = useState('0.01')

   const { data: txHash, sendTransaction } = useSendTransaction()

   const { isLoading, error, isSuccess } = useWaitForTransactionReceipt({
     hash: txHash,
   })

   const handleSendTransaction = () => {
     const value = parseEther(amount)
     sendTransaction({ value: value, to })
   }

   const handleToAddressInput = (event: React.ChangeEvent<HTMLInputElement>) => {
     const inputAddress = event.target.value
     if (isAddress(inputAddress)) {
       setTo(inputAddress)
     }
   }

   useEffect(() => {
     if (isSuccess) {
       console.log(`Transaction successful`)
     } else if (error) {
       console.error(`Transaction failed: ${error.message}`)
     } else if (isLoading) {
       console.log('isloading ')
     }
   }, [isSuccess, isLoading, error])

   return (
     <div>
       <div>
         <label>
           Recipient address:
           <input type='text' placeholder='0x...' onChange={handleToAddressInput} value={to ?? ''} />
         </label>
       </div>
       <div>
         <label>
           Amount (ETH):
           <input type='text' value={amount} onChange={(e) => setAmount(e.target.value)} />
         </label>
       </div>
       <button onClick={handleSendTransaction} disabled={false}>
         Send ETH
       </button>
       <div data-testid='test'></div>
       {error && <div data-testid='error'></div>}
       {isLoading && <div data-testid='pending'></div>}
       {isSuccess && <div data-testid='success'></div>}
     </div>
   )
 }