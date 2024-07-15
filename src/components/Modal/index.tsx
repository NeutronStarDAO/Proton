import React, {useRef} from 'react';
import './index.scss';
import {useGSAP} from "@gsap/react";
import gsap from 'gsap';

export const Modal = ({open, component, setOpen, canClose = true}: {
  component: JSX.Element,
  open: boolean,
  setOpen: Function,
  canClose?: boolean
}) => {
  const ref = useRef(null)

  useGSAP(() => {
    if (!ref.current) return
    if (open) {
      gsap.to(ref.current, {duration: 0.4, autoAlpha: 1, display: "flex"})
      gsap.to(".modal", {duration: 0.4, scale: "1", ease: "back"})
    } else {
      gsap.to(ref.current, {duration: 0.4, autoAlpha: 0, display: "none"})
      gsap.to(".modal", {duration: 0.4, scale: "0.9", ease: "back"})
    }
  }, {dependencies: [open, ref], scope: ref})

  return (
    <>
      <div className="modal_overlay" ref={ref} onClick={() => canClose ? null : setOpen(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div>
            {component}
          </div>
        </div>
      </div>
    </>
  );
};

