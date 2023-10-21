/* eslint-disable react/no-unescaped-entities */
import { getAuthSession } from "@/lib/auth";
import React from "react";
import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";
import CreateCourseForm from "@/components/CreateCourseForm";
// import CreateCourseForm from "@/components/CreateCourseForm";
// import { checkSubscription } from "@/lib/subscription";

type Props = {};

const CreatePage = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/gallery");
  }
//   const isPro = await checkSubscription();
  return (
    <div className="flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0">
      <h1 className="self-center text-3xl font-bold text-center sm:text-6xl">
        Project C
      </h1>
      <div className="flex p-4 mt-5 border-none bg-secondary">
        <InfoIcon className="w-12 h-12 mr-3 text-blue-400" />
        <div>
       
        Start by sharing the course title or specific skills you're eager to explore. Next, detail the individual units or key concepts you want to master. Thats all! Sit back and watch as our advanced AI crafts a fully customized course, uniquely designed for your learning desires. 
        </div>
      </div>

      <CreateCourseForm/>
    </div>
  );
};

export default CreatePage;