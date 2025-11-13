import styled from "styled-components";
import { cursorGrab, cursorGrabbing } from "../../../../theme/mixins";
import { sizesMedia, primaryColor } from "../../../../theme/variables";

const UpdateTableContainer = styled.section`
  position: relative;
  transform: translate(0);
  top: 0;
  left: 0;

  &::after {
    display: none;
  }

  //Responsive styles
  @media screen and (max-width: ${sizesMedia.xmd}) {
    width: 100%;
    /* overflow-x: scroll;
    ${cursorGrab()};
    ${cursorGrabbing()}; */
  }
  @media screen and (max-width: ${sizesMedia.xmd}) {
    table {
      thead {
        display: none;
      }

      tbody,
      tr,
      td {
        display: block;
        width: 100%;
      }

      tr {
        border: 1px solid ${primaryColor};
        padding: 0.5rem;
      }

      td {
        text-align: right;
        padding-left: 50%;
        position: relative;
        font-size: 1rem;
        border: none;
        border-bottom: 1px solid #fff;
      }

      td::before {
        content: attr(data-label);
        position: absolute;
        left: 0.5rem;
        width: 45%;
        padding-right: 1rem;
        font-weight: bold;
        text-align: left;
        white-space: nowrap;
        color: #fff;
      }
    }
  }
`;

export { UpdateTableContainer };
