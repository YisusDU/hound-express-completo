import styled from "styled-components";
import {
  sizesMedia,
  secondaryColor,
  primaryColor,
} from "../../../../theme/variables";
import { cursorGrab, cursorGrabbing } from "../../../../theme/mixins";

const HistoryTableContainer = styled.section`
  //Responsive styles

  /* @media screen and (max-width: ${sizesMedia.xsm}) {
    overflow-x: scroll;
    ${cursorGrab()};
    ${cursorGrabbing()};
  } */
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
        line-height: normal;
      }

      tr {
        margin-bottom: 1.5rem;
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

export { HistoryTableContainer };
