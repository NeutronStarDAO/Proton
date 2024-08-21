import React, {useRef} from 'react';
import './index.scss';
import {useGSAP} from "@gsap/react";
import gsap from 'gsap';
import {useAuth} from "../../utils/useAuth";

export const Modal = ({open, children, setOpen, canClose = true}: {
  children: JSX.Element,
  open: boolean,
  setOpen: Function,
  canClose?: boolean
}) => {
  const ref = useRef(null)
  const {isDark} = useAuth()
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
      <div className={`modal_overlay ${isDark ? "dark_modal_overlay" : ""}`} ref={ref} onClick={(e) => {
        if (e.currentTarget === e.target && canClose) {
          setOpen(false)
        }
      }}>
        <div className="modal">
          <div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

