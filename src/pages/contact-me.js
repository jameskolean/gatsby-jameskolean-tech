/* eslint jsx-a11y/label-has-associated-control: 0 */
import React from 'react'
import Layout from '../components/layout'
import styled from '@emotion/styled'
import Select from '../components/select'

const AboutMePage = () => {
  const ContachMe = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    justify-content: space-around;
    flex-direction: column;
  }}

`
  const Form = styled.form`
    // width: 450px;
    font-size: 16px;
    background: #495c70;
    padding: 30px 30px 15px 30px;
    border: 5px solid #53687e;
    input[type='submit'],
    input[type='button'],
    input[type='text'],
    input[type='email'],
    textarea,
    label {
      // font-family: Georgia, 'Times New Roman', Times, serif;
      font-size: 16px;
      color: #fff;
    }
    label {
      display: block;
      margin-bottom: 10px;
    }
    label > span {
      display: inline-block;
      float: left;
      width: 150px;
    }
    input[type='text'],
    input[type='email'] {
      background: transparent;
      border: none;
      border-bottom: 1px dashed #83a4c5;
      width: 275px;
      outline: none;
      padding: 0px 0px 0px 0px;
      font-style: italic;
    }
    .radio {
      margin-left: 1rem;
    }
    textarea {
      font-style: italic;
      padding: 0px 0px 0px 0px;
      background: transparent;
      outline: none;
      border: none;
      border-bottom: 1px dashed #83a4c5;
      width: 275px;
      overflow: hidden;
      resize: none;
      height: 20px;
    }

    textarea:focus,
    input[type='text']:focus,
    input[type='email']:focus,
    input[type='email'] :focus {
      border-bottom: 1px dashed #d9ffa9;
    }

    input[type='submit'],
    input[type='button'] {
      background: #576e86;
      border: none;
      padding: 8px 10px 8px 10px;
      border-radius: 5px;
      color: #a8bace;
    }
    input[type='submit']:hover,
    input[type='button']:hover {
      background: #394d61;
    }
  `
  const Note = styled.p`
    color: white;
    font-size: 13px;
    font-style: italic;
  `
  const adjustTextarea = (e) => {
    const me = e.currentTarget
    me.style.height = '20px'
    me.style.height = me.scrollHeight + 'px'
  }
  return (
    <Layout>
      <ContachMe>
        <h2>Contact Me</h2>
        <Form
          name='jameskolean-tech-contact-request'
          method='POST'
          data-netlify='true'
        >
          <Note>* All fields are required</Note>
          <label>Nature of request:</label>
          <label className='radio'>
            Request help building software
            <input
              required={true}
              type='radio'
              id='hire-me'
              name='requestType[]'
              value='hire-me'
            />
          </label>
          <label className='radio'>
            Question about site content
            <input
              type='radio'
              id='content-question'
              name='requestType[]'
              value='content-question'
            />
          </label>
          <label className='radio'>
            Other
            <input type='radio' id='other' name='requestType[]' value='other' />
          </label>
          <label>
            Your Name: <input type='text' name='name' required={true} />
          </label>
          <label>
            Your Email: <input type='email' name='email' required={true} />
          </label>
          <label>
            Message:{' '}
            <textarea
              name='message'
              rows='4'
              cols='50'
              required={true}
              onKeyUp={adjustTextarea}
            ></textarea>
          </label>
          <p>
            <button type='submit'>Send</button>
          </p>
        </Form>
      </ContachMe>
    </Layout>
  )
}

export default AboutMePage
