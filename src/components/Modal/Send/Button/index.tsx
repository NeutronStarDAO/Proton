import React, {useState} from 'react';
import styles from './index.module.scss';

export const Button = ({api}: { api: Function }) => {
  const [buttonState, setButtonState] = useState<'ready' | 'loading' | 'complete'>('ready');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const clickButton = async () => {
    if (!disabled && !loading) {
      setDisabled(true);
      setLoading(true);
      setButtonState('loading');

      const res = await api();
      if (res === 0) {
        setDisabled(false);
        setLoading(false);
        setButtonState('ready');
        return
      }
      setButtonState('complete');

      await new Promise(resolve => setTimeout(resolve, 1000));
      setDisabled(false);
      setLoading(false);
      setButtonState('ready');
    }
  };

  return (
    <button
      className={`${styles.animatedButton} ${styles[buttonState]}`}
      onClick={clickButton}
      disabled={disabled || loading}
    >
      <div className={styles.message}>
        <span className={styles.buttonText}>Done</span>
      </div>
      <div className={`${styles.message} ${styles.loadingMessage}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 17">
          <circle className={styles.loadingCircle} cx="2.2" cy="10" r="1.6"/>
          <circle className={styles.loadingCircle} cx="9.5" cy="10" r="1.6"/>
          <circle className={styles.loadingCircle} cx="16.8" cy="10" r="1.6"/>
        </svg>
      </div>
      <div className={`${styles.message} ${styles.successMessage}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 11" className={styles.successIcon}>
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points="1.4,5.8 5.1,9.5 11.6,2.1"/>
        </svg>
        <span className={styles.buttonText}>Success</span>
      </div>
    </button>
  );
};
