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
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
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

export const ShowMoreTest = React.memo((props: {
  content: string,
  postId?: string,
  playOne?: string,
  setPlayOne?: Function,
  className?: string
}) => {
  const {content, className, postId} = props
  const [videoId, setVideoId] = useState<string[]>([])
  const formattedText = content.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      <LinkifyTextWithPreview text={line} setVideoId={setVideoId}/>
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
      {videoId.length > 0 && postId && <YouTubeEmbed  {...props} videoId={videoId[0]}/>}
    </div>
  );
})

const urlRegex = /(https?:\/\/[^\s]+)/g;

const isYouTubeUrl = (url: string) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
};

const getVideoId = (url: string) => {
  let videoId = '';
  if (url.includes('youtube.com')) {
    videoId = url.split('v=')[1];
  } else if (url.includes('youtu.be')) {
    videoId = url.split('/').pop() || '';
  }
  const ampersandPosition = videoId.indexOf('&');
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }
  return videoId
};

const LinkifyTextWithPreview = ({text, setVideoId}: { text: string, setVideoId: Function }) => {
  const parts = text.split(urlRegex);

  useEffect(() => {
    parts && parts.map(v => {
      if (urlRegex.test(v)) {
        if (isYouTubeUrl(v)) {
          const videoId = getVideoId(v);
          setVideoId((pre: string[]) => [...pre, videoId])
        }
      }
    })
  }, [parts])
  return (
    <div>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <div className="3" key={index}>
              <a style={{color: "#438EFF", wordWrap: "break-word"}} href={part} target="_blank"
                 rel="noopener noreferrer">
                {part}
              </a>
            </div>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

let playerCounter = 0;

const YouTubeEmbed = ({videoId, postId, setPlayOne, playOne}: {
  videoId: string,
  playOne?: string,
  setPlayOne?: Function,
  postId?: string
}) => {
  const playerIdRef = useRef(`youtube-player-${playerCounter++}`);

  const isPlaying = React.useMemo(() => {
    return postId === playOne
  }, [postId, playOne])

  useEffect(() => {
    if (!isPlaying || !playerIdRef.current) return;

    const loadYouTubeAPI = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    const initializeYouTubePlayer = () => {
      new (window as any).YT.Player(playerIdRef.current, {
        videoId: videoId,
        events: {
          'onReady': (event: any) => {
          },
        },
      });
    };

    loadYouTubeAPI();

    if ((window as any).YT && (window as any).YT.Player) {
      initializeYouTubePlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initializeYouTubePlayer;
    }

    return () => {
      const playerElement = document.getElementById(playerIdRef.current);
      if (playerElement) {
        playerElement.innerHTML = '';
      }
    };
  }, [videoId, isPlaying, playerIdRef]);

  const handleThumbnailClick = () => {
    setPlayOne?.(postId)
  };
  if (!isPlaying) {
    return (
      <div onClick={handleThumbnailClick} style={{cursor: 'pointer'}}>
        <img
          src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
          alt="YouTube video thumbnail"
          style={{width: '100%', height: 'auto'}}
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}>
          play
        </div>
      </div>
    );
  }

  return (
    <div id={playerIdRef.current} style={{width: '100%', height: '315px'}}></div>
  );
};



