import React from 'react'
import styled from '@emotion/styled'
import { lighten } from 'polished'
import { navigate } from 'gatsby'

const ctaCard = ({ title, buttonLabel, buttonUrl, image, children }) => {
  const delay = 700
  const easing = 'cubic-bezier(0.19, 1, 0.22, 1)'
  const Card = styled.div`
    position: relative;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    padding: 1rem;
    width: 300px;
    text-align: center;
    color: whitesmoke;
    background-color: whitesmoke;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1), 0 2px 2px rgba(0, 0, 0, 0.1),
      0 4px 4px rgba(0, 0, 0, 0.1), 0 8px 8px rgba(0, 0, 0, 0.1),
      0 16px 16px rgba(0, 0, 0, 0.1);
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 110%;
      background-size: cover;
      background-position: 0 0;
      transition: transform ${delay * 1.5}ms ${easing};
      pointer-events: none;
      background-image: url(${image});
    }

    &:after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 200%;
      pointer-events: none;
      background-image: linear-gradient(
        to bottom,
        hsla(0, 0%, 0%, 0) 0%,
        hsla(0, 0%, 0%, 0.009) 11.7%,
        hsla(0, 0%, 0%, 0.034) 22.1%,
        hsla(0, 0%, 0%, 0.072) 31.2%,
        hsla(0, 0%, 0%, 0.123) 39.4%,
        hsla(0, 0%, 0%, 0.182) 46.6%,
        hsla(0, 0%, 0%, 0.249) 53.1%,
        hsla(0, 0%, 0%, 0.32) 58.9%,
        hsla(0, 0%, 0%, 0.394) 64.3%,
        hsla(0, 0%, 0%, 0.468) 69.3%,
        hsla(0, 0%, 0%, 0.54) 74.1%,
        hsla(0, 0%, 0%, 0.607) 78.8%,
        hsla(0, 0%, 0%, 0.668) 83.6%,
        hsla(0, 0%, 0%, 0.721) 88.7%,
        hsla(0, 0%, 0%, 0.762) 94.1%,
        hsla(0, 0%, 0%, 0.79) 100%
      );
      transform: translateY(-50%);
      transition: transform ${delay * 2}ms ${easing};
    }
    :hover {
      :after {
        transform: translateY(0);
      }
    }
    :hover,
    :focus-within {
      align-items: center;

      &:before {
        transform: translateY(-4%);
      }
      &:after {
        transform: translateY(-50%);
      }
      > .content {
        transform: translateY(0);

        > *:not(.title) {
          opacity: 1;
          transition: opacity ${delay * 10}ms ${easing};
          // transform: translateY(0);
          // transition: transform ${delay * 2}ms ${easing};
        }
      }
    }
  `

  const Content = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 1rem;
    transform: translateY(70%);
    transition: transform ${delay}ms ${easing};
    z-index: 1;

    > * + * {
      margin-top: 1rem;
    }
    > *:not(.title) {
      opacity: 0;
      transition: opacity ${delay * 10}ms ${easing};
    }
  `

  const Title = styled.h2`
    font-size: 1.3rem;
    font-weight: bold;
    line-height: 1.2;
  `
  const Copy = styled.p`
    font-size: 1.125rem;
    font-style: italic;
    line-height: 1.35;
  `

  const Button = styled.button`
    cursor: pointer;
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 0.65rem;
    font-weight: bold;
    letter-spacing: 0.025rem;
    text-transform: uppercase;
    color: white;
    background-color: black;
    border: none;

    &:hover {
      background-color: ${lighten(0.25, 'black')};
    }

    &:focus {
      outline: 1px dashed yellow;
      outline-offset: 3px;
    }
  `
  return (
    <Card>
      <Content className='content'>
        <Title className='title'>{title}</Title>
        <Copy>{children} </Copy>
        <Button
          onClick={(event) => {
            navigate(buttonUrl)
          }}
        >
          {buttonLabel}
        </Button>
      </Content>
    </Card>
  )
}
export default ctaCard
