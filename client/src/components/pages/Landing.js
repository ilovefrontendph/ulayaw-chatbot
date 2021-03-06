import React, { useContext } from "react";
import { ThoughtDiaryContext } from "../../Context/ThoughtDiaryContext";
import { ShowMoodsContext } from "../../Context/ShowMoodsContext";
import homeUlayaw from "../../assets/home_ulayaw.png";

const Landing = (props) => {
  const { showThoughtDiaryTool, setShowThoughtDiaryTool } =
    useContext(ThoughtDiaryContext);
  console.log(showThoughtDiaryTool);

  const { showMoods, setShowMoods } = useContext(ShowMoodsContext);

  return (
    <div
      // className={
      //   showThoughtDiaryTool
      //     ? "hidden "
      //     : "container mx-auto my-auto lg:pt-[100px] 2xl:pt-[200px] lg:transform lg:scale-[.79] 2xl:scale-[1]"
      // }
      className={
        showMoods
          ? "hidden  "
          : showThoughtDiaryTool
          ? "hidden  "
          : "container lg:mx-auto my-12 lg:my-auto lg:pt-[100px] 2xl:pt-[200px] lg:transform lg:scale-[.79] 2xl:scale-[1] h-[2000px] grow w-full "
      }
    >
      <div className="lg:grid lg:grid-cols-12 gap-4 ">
        {/* left */}
        <div className="col-span-5 flex justify-center ">
          <label>
            <img
              className="h-[200px] w-[200px] lg:h-[400px] lg:w-[400px]"
              src={homeUlayaw}
            />
          </label>
        </div>
        {/* right */}
        <div className="col-span-7 flex flex-col md:px-[150px] lg:px-0 px-4">
          <label className="text-[24px] lg:text-[48px] leading-tight text-[#28AFE8]">
            Kaibigan sa kalusugang pangkaisipan.
          </label>
          <label className="text-[15px] lg:text-[30px] text-[#5A676D] ">
            Ipahayag ang iyong nararamdaman.
          </label>

          {/* buttons-upper */}
          {/* <div className="text-[24px] font-medium flex flex-row space-x-[14px]">
            <button className="w-[183px] mt-[48px] h-[57px] bg-[#5DCFFF] rounded-[15px]  text-center py-2 text-[#29363C] cursor-pointer transform hover:scale-[1.010]">
              Assessment
            </button>
            <input
              className="border-[1px] border-[#3E3E3E] w-[382px] mt-[48px] h-[57px] rounded-[5px] text-[#737373] font-normal px-6 py-2  focus:ring-[#5DCFFF] transform hover:scale-[1.005]"
              type="text"
              placeholder="Enter a code"
            />
          </div> */}

          <div className="text-center text-[#7a6d6d] w-full lg:w-[579px] mt-[23px] border-t-[1px] border-[#3E3E3E]">
            {/* or */}
          </div>

          {/* buttons-lower */}
          <div className="text-[12px] lg:text-[24px] font-medium flex flex-row space-x-[14px] w-full lg:w-[579px] text-[#1A4A61] text-justify">
            <label>
              Pindutin ang emoji ni Ulayaw upang makapagsimula sa
              pakikipag-usap.
            </label>
            {/* <button className="w-full mt-[23px] h-[57px] bg-[#5DCFFF] rounded-[15px]  text-center py-2 text-[#29363C] transform hover:scale-[1.005] cursor-pointer">
              <p> Conversation</p>
            </button> */}
          </div>
        </div>
      </div>
      <iframe
        className="h-[800px] w-full mt-[100px]"
        src="https://www.youtube.com/embed/W1xYfL0D760"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  );
};

export default Landing;
