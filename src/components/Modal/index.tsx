import React from 'react';
import './index.scss';

export const Modal = ({open, component}: { component: JSX.Element, open: boolean }) => {
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

