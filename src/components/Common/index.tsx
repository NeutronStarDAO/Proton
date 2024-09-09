import React, {MouseEventHandler, useEffect, useRef, useState} from "react";
import autosize from "autosize";
import "./index.scss"
import ShowMoreText from "react-show-more-text";

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

export const ShowMoreTest = React.memo(({content, className}: { content: string, className?: string }) => {
  const formattedText = content.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {/*{line}*/}
      <LinkifyTextWithPreview text={line}/>
      <br/>
    </React.Fragment>
  ));
  return (
    <div>
      <ShowMoreText
        lines={7}
        more={"Show more"}
        less={"Show less"}
        truncatedEndingComponent={"...   "}
        className={className}
      >
        {formattedText}
      </ShowMoreText>
    </div>
  );
})

const API_KEY = "d09fc141d3a6b5c8aa84a4c4b48fc014"

const LinkPreview = ({url}: { url: string }) => {
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (url) {
      const fetchPreview = async () => {
        try {
          const response = await fetch(`https://api.linkpreview.net/?key=${API_KEY}&q=${url}`);
          const data = await response.json();
          setPreviewData(data);
        } catch (error) {
          console.error("Error fetching preview:", error);
        }
      };
      fetchPreview();
    }
  }, [url]);

  if (!previewData) return <p>Loading preview...</p>;

  return (
    <div className="link-preview" style={{marginTop: '10px'}}>
      <a href={previewData.url} target="_blank" rel="noopener noreferrer">
        <img src={previewData.image} alt="Link Preview" style={{width: "100px", height: "auto"}}/>
        <h3>{previewData.title}</h3>
        <p>{previewData.description}</p>
      </a>
    </div>
  );
};

const urlRegex = /(https?:\/\/[^\s]+)/g;

const LinkifyTextWithPreview = ({text}: { text: string }) => {
  const parts = text.split(urlRegex);
  return (
    <div>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <div key={index}>
              <a style={{color: "#438EFF", wordWrap: "break-word"}} href={part} target="_blank"
                 rel="noopener noreferrer">{part}</a>
            </div>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

