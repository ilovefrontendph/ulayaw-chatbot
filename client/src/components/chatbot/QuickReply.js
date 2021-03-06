import React, { useContext, useState } from "react";
import { ShowChatBox } from "../../Context/ShowChatBox";

const QuickReply = (props) => {
  const { showChatBox, setShowChatBox } = useContext(ShowChatBox);

  if (props.reply.structValue.fields.payload) {
    return (
      <a
        style={{ margin: 3 }}
        href="/"
        className="bg-[#5DCFFF] text-white rounded-full  p-2 px-4 self-center h-auto  "
        onClick={(event) => {
          props.click(
            event,
            props.reply.structValue.fields.payload.stringValue,
            props.reply.structValue.fields.text.stringValue
          );
          if (
            props.reply.structValue.fields.payload.stringValue ===
            "wala_na_mood_assess"
          ) {
            setShowChatBox(false);
          }
          if (
            props.reply.structValue.fields.payload.stringValue ===
            "meron_pa_mood_assess"
          ) {
            setShowChatBox(true);
          }
          // console.log(props.showDiary, "diary");
          if (props.showDiary) setShowChatBox(false);
          else setShowChatBox(true);
          if (props.showUTS) {
            setShowChatBox(false);
          }

          if (props.dontShowChatBox === true) setShowChatBox(false);
        }}
      >
        {props.reply.structValue.fields.text.stringValue}
      </a>
    );
  } else {
    return (
      <a
        style={{ margin: 3 }}
        href={props.reply.structValue.fields.link.stringValue}
        className="bg-[#5DCFFF] rounded-full p-2 text-white self-center  w-10 h-auto"
      >
        {props.reply.structValue.fields.text.stringValue}
      </a>
    );
  }
};

export default QuickReply;
