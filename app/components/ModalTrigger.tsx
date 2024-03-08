'use client';
import React, { ReactNode, useState } from 'react';
import Modal from './Modal.client';

interface ModalTriggerProps {
  children: ReactNode;
}
const ModalTrigger: React.FC<ModalTriggerProps> = ({ children }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>Open Modal</button>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          {children}
        </Modal>
      )}
    </>
  );
};

export default ModalTrigger;
