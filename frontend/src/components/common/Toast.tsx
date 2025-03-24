import React from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const typeConfig = {
  success: {
    icon: CheckCircleIcon,
    className: 'text-green-500 bg-green-50 border-green-200',
  },
  error: {
    icon: XCircleIcon,
    className: 'text-red-500 bg-red-50 border-red-200',
  },
  warning: {
    icon: ExclamationCircleIcon,
    className: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'text-blue-500 bg-blue-50 border-blue-200',
  },
};

const positionClasses = {
  'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 sm:top-6',
  'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6',
};

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
  position = 'top-right',
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const { icon: Icon, className } = typeConfig[type];

  return (
    <Transition
      show={isVisible}
      as={React.Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom={`translate-y-2 opacity-0 ${position.startsWith('bottom') ? 'sm:translate-y-2' : 'sm:-translate-y-2'}`}
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={`fixed z-50 w-full max-w-sm sm:max-w-md ${positionClasses[position]}`}>
        <div 
          className={`pointer-events-auto w-full overflow-hidden rounded-lg border p-4 shadow-lg sm:p-6 ${className}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium sm:text-base">{title}</p>
              {message && (
                <p className="mt-1 text-sm text-secondary-500 sm:text-base">
                  {message}
                </p>
              )}
            </div>
            <div className="flex flex-shrink-0 pl-2">
              <button
                type="button"
                className="inline-flex rounded-md text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">닫기</span>
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}; 