import React from 'react';
import './index.scss';

export const Modal = ({open, component, setOpen}: { component: JSX.Element, open: boolean, setOpen: Function }) => {
  return (
    <>
      {open && (
        <div className="modal-overlay">
          <div className="modal">
            <div>
              {component}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

