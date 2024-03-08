'use client';
import React, { useEffect, ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

// New custom hook
const useEscapeKeyUp = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    if (isOpen) {
      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keyup', handleKeyUp);
      return () => window.removeEventListener('keyup', handleKeyUp);
    }
  }, [isOpen, onClose]);
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className = '' }) => {
  // Use the custom hook instead of the useEffect directly in the component
  useEscapeKeyUp(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
