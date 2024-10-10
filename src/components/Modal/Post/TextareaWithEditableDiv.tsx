import React, {useState, useRef, useEffect, forwardRef, CSSProperties} from 'react';

type Props = {
  areaStyle?: CSSProperties
}

const TextareaWithEditableDiv = forwardRef((props: Props, ref) => {
  const [text, setText] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const textareaRef = ref;
  const editableDivRef = useRef(null);
  const {areaStyle} = props

  // 格式化文本，将标签着色
  const formatText = (rawText: any) => {
    const documentFragment = document.createDocumentFragment();
    const regex = /(#\w+)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(rawText))) {
      const span = document.createElement('span');
      span.style.color = 'blue';
      span.textContent = match[0];
      documentFragment.appendChild(
        document.createTextNode(rawText.slice(lastIndex, match.index))
      );
      documentFragment.appendChild(span);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < rawText.length) {
      documentFragment.appendChild(
        document.createTextNode(rawText.slice(lastIndex))
      );
    }

    return documentFragment;
  };

  // 处理输入变化
  const handleInputChange = (event: any) => {
    const newText = event.target.value;
    // console.log(newText);
    setText(newText);
    // @ts-ignore
    setHashtags([...new Set(newText.match(/#\w+/g) || [])]);
  };

  // 同步 contentEditable div 的内容
  useEffect(() => {
    if (editableDivRef.current) {
      const div: any = editableDivRef.current;
      div.innerHTML = '';
      div.appendChild(formatText(text));
    }
  }, [text, editableDivRef]);

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    if (editableDivRef.current) {
      // @ts-ignore
      editableDivRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  return (
    <div className="tweet-container" style={{position: 'relative', width: '100%', ...areaStyle}}>
      <textarea
        value={text}
        onChange={handleInputChange}
        onScroll={handleScroll}
        style={{
          ...commonStyle,
          outline: 'none', // Remove focus outline
          caretColor: 'black', // Make cursor visible
          resize: 'none', // Prevent resizing
          backgroundColor: 'transparent', // Transparent background
          color: 'red',
          zIndex: 1,
          boxShadow: "none",
        }}
      />
      <div
        ref={editableDivRef}
        // contentEditable
        suppressContentEditableWarning
        style={{
          ...commonStyle,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          textAlign: "start",
          pointerEvents:"none"
        }}
      ></div>
    </div>
  );
});

const commonStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  fontSize: "2.1rem",
  width: "100%",
  height: "100%",
  fontFamily: 'Arial, Helvetica, sans-serif',
  lineHeight: "2.1rem",
  wordSpacing: "1px",
  letterSpacing: "1px",
  padding: "0",
  border: "0",
  overflowY: "auto",
  maxHeight: "30rem"
}

export default TextareaWithEditableDiv;
