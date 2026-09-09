import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-3 py-4 border-t border-gray-100">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
