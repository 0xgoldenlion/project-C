"use client";
import React from "react";
import { SiweMessage } from "siwe";
import { polygonMumbai } from "viem/chains";
// @ts-ignore
import {useConnect , useAccount, useSignMessage } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { getCsrfToken, signIn } from "next-auth/react";
import { Button } from "./ui/button";

type Props = {};

function  SignInButton() {
    const [mounted, setMounted] = React.useState(false);
    const { address, isConnected } = useAccount();
    const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
    const { open } = useWeb3Modal();
    const { signMessageAsync } = useSignMessage();
    const [hasSigned, setHasSigned] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if(!mounted) return <></>
  
    const handleSign = async () => {
        if (!isConnected) open();
        try {
          const message = new SiweMessage({
            domain: window.location.host,
            uri: window.location.origin,
            version: "1",
            address: address as `0x${string}`,
            statement: process.env.NEXT_PUBLIC_SIGNIN_MESSAGE,
            nonce: await getCsrfToken(),
            chainId: polygonMumbai.id,
          });
          console.log("getCsrfToken", getCsrfToken())
    
          const signedMessage = await signMessageAsync({
            message: message.prepareMessage(),
          });
    
          setHasSigned(true);
    
          const response = await signIn("eee", {
            message: JSON.stringify(message),
            signedMessage,
            redirect: true,
           
          });
          if (response?.error) {
            console.log("Error occured:", response.error);
          }
    
        } catch (error) {
          console.log("Error Occured", error);
        }
      };


  return (
   

    <Button
      variant="ghost"
      onClick={handleSign}
    >
      Sign In
    </Button>
 
   
  );
};

export default SignInButton;