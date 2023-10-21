"use client";
import { useSession } from "next-auth/react";
import React from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import axios from "axios";
import contract from "@/lib/contract.json"
import {useConnect , useAccount, useSignMessage, useContractWrite, parseEther } from "wagmi";
// import { prisma } from "@/lib/db";



type Props = {};

const SubscriptionAction = (props: Props) => {
  const { data } = useSession();
  const [loading, setLoading] = React.useState(false);
  const { address,isConnected } = useAccount()
  
  const { write } = useContractWrite({
    address: contract.address,
    abi: contract.abi,
    functionName: 'buyCredits',
    // args:[5],
    // value: '5000000000000000000',
    onError(error) {
      console.log('Error', error)
    },
    onSuccess(data) {
        console.log('Success', data)
        increaseCredit()
      },
  })

  const updateCredit = async () => {

    // const creditsupdate = data?.user.credits + 5 
    // try {
    //     await prisma.user.update({
    //         where: { id: data?.user.id },
    //         data: {
    //           credits: creditsupdate ,
    //         },
    //       });
      
    //     } catch (error) {
    //         console.log("error", error);
    //       }

  }

  const handleSubscribe = async () => {
    setLoading(true);
    try {
    if (isConnected) {
           write({
              args: [BigInt(1)],
              value: BigInt(1000000000000000000),
              from: address
            });
          console.log('done')
    }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const increaseCredit = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/buy");
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center w-1/2 p-4 mx-auto mt-4 rounded-md bg-secondary">
      {data?.user.credits}   Generations remaining
      <Progress
        className="mt-2"
        value={data?.user.credits ? (data.user.credits / 10) * 100 : 0}
      />
      <Button
        disabled={loading}
        onClick={handleSubscribe}
        className="mt-3 font-bold text-white transition bg-gradient-to-tr from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
      >
        Buy More
        <Zap className="fill-white ml-2" />
      </Button>
    </div>
  );
};

export default SubscriptionAction;