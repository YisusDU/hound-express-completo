import { useEffect, useRef } from "react";

const useDraggTable = () => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const table = tableRef.current;
    let isDown: boolean = false;
    let startX: number = 0;
    let scrollLeft = 0;

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault(); // prevent select the text inside
      isDown = true;
      if (table) {
        startX = event.pageX - table.offsetLeft;
        scrollLeft = table.scrollLeft;
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      isDown = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDown) return;
      if (table) {
        const moveX = event.pageX - table.offsetLeft;
        const walk = (moveX - startX) * 1.5;
        table.scrollLeft = scrollLeft - walk;
      }
    };

    const node = tableRef.current;
    if (node) {
      node.addEventListener("mousedown", handleMouseDown);
      node.addEventListener("mouseup", handleMouseUp);
      node.addEventListener("mouseleave", handleMouseUp);
      node.addEventListener("mousemove", handleMouseMove);
    }

    // Limpieza al desmontar el componente
    return () => {
      if (node) {
        node.removeEventListener("mousedown", handleMouseDown);
        node.removeEventListener("mouseup", handleMouseUp);
        node.removeEventListener("mouseleave", handleMouseUp);
        node.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return tableRef;
};

export default useDraggTable;
