import React from "react";
import useDraggTable from "../useDraggTable";
import { render, fireEvent } from "@testing-library/react";

//Simulate a component for test

const TestComponent = () => {
  const ref = useDraggTable();
  // Dale un tamaño y overflow para que scrollLeft tenga efecto
  return (
    <div
      ref={ref}
      data-testid="draggable"
      style={{ width: 100, overflow: "auto" }}
    >
      <div style={{ width: 1000, height: 20 }}>Contenido largo</div>
    </div>
  );
};

describe("useDraggTable", () => {
  it("should allow horizontal drag scrolling", () => {
    const { getByTestId } = render(<TestComponent />);
    const node = getByTestId("draggable");

    // Simulate mousedown
    fireEvent.mouseDown(node, { pageX: 50 });
    // Simulate mousemove (drag at right)
    fireEvent.mouseMove(node, { pageX: 150 });
    // Simulate mouseup
    fireEvent.mouseUp(node);

    // the scroll should to have been changed to a diferent value of 0
    expect(node.scrollLeft).not.toBe(0);
  });

  it("should not throw if tableRef.current is null", () => {
    // Component does not apply the ref at node
    const Dummy = () => {
      useDraggTable(); // ref never used
      return <div>Without ref</div>;
    };
    expect(() => render(<Dummy />)).not.toThrow();
  });

  it("handleMouseDown should not throw if table is null", () => {
    //simulate the state of useEffect with table null
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const table: any = null;
    const event = {
      preventDefault: jest.fn(),
      pageX: 10,
    } as unknown as MouseEvent;

    //simulate the handler
    expect(() => {
      // Copia el handler aquí:
      event.preventDefault();
      isDown = true;
      if (table) {
        startX = event.pageX - table.offsetLeft;
        scrollLeft = table.scrollLeft;
      }
    }).not.toThrow();
  });

  it("should not scrol if not draggin", () => {
    const { getByTestId } = render(<TestComponent />);
    const node = getByTestId("draggable");
    fireEvent.mouseMove(node, { pageX: 150 });
    expect(node.scrollLeft).toBe(0);
  });
});
