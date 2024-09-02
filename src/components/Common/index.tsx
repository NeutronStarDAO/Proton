import React, {MouseEventHandler, useEffect, useRef, useState} from "react";
import autosize from "autosize";
import "./index.scss"

type Props = {
  open: boolean,
  setOpen: Function,
  replyContent: string,
  setReplyContent: Function,
  callBack: MouseEventHandler<HTMLDivElement>,
  rows?: number
}

export const CommentInput = React.memo(({open, setOpen, replyContent, setReplyContent, callBack, rows = 3}: Props) => {
  const specifiedElementRef = useRef(null);
  const textareaRef = useRef<any>(null);

  const click = (event: any) => {
    //@ts-ignore
    if (!(specifiedElementRef.current && specifiedElementRef.current.contains(event.target))) {
      setOpen(false)
    }
  };

  useEffect(() => {
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('click', click);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);

      return () => {
        autosize.destroy(textareaRef.current);
      };
    }
  }, [textareaRef, open]);

  return <div onClick={e => {
    e.stopPropagation()
  }} ref={specifiedElementRef} style={{display: open ? "flex" : "none"}} className={"common_reply_wrap"}>
      <textarea ref={textareaRef} onChange={e => setReplyContent(e.target.value)}
                value={replyContent}
                name=""
                id=""
                rows={rows}
                placeholder={"Reply"}/>

    <div onClick={callBack} style={(() => {
      const canSend = replyContent.length > 0
      if (!canSend)
        return {
          background: "gray", cursor: "no-drop"
        }
    })()}>
      Send
    </div>

  </div>
})
