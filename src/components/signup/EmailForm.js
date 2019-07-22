// @flow
import React from 'react'
import debounce from 'lodash/debounce'
import { userModelValidations } from '../../lib/gundb/UserModel'
import userStorage from '../../lib/gundb/UserStorage'
import { withStyles } from '../../lib/styles'
import Config from '../../config/config'
import InputText from '../common/form/InputText'
import Section from '../common/layout/Section'
import CustomWrapper from './signUpWrapper'

type Props = {
  doneCallback: ({ email: string }) => null,
  screenProps: any,
  navigation: any,
}

export type EmailRecord = {
  email: string,
  isEmailConfirmed?: boolean,
  errorMessage?: string,
  isValid: boolean,
}

type State = EmailRecord & { valid?: boolean }

class EmailForm extends React.Component<Props, State> {
  state = {
    email: this.props.screenProps.data.email || '',
    errorMessage: '',
    isValid: false,
  }

  handleChange = (email: string) => {
    this.checkErrorsSlow()

    this.setState({ email })
  }

  handleSubmit = async () => {
    const isValid = await this.checkErrors()
    if (isValid) {
      this.props.screenProps.doneCallback({ email: this.state.email })
    }
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter' && this.state.isValid) {
      this.handleSubmit()
    }
  }

  checkErrors = async () => {
    const modelErrorMessage = userModelValidations.email(this.state.email)
    const isValidIndexValue =
      Config.skipEmailVerification || (await userStorage.isValidValue('email', this.state.email))
    const errorMessage = modelErrorMessage || (isValidIndexValue ? '' : 'Unavailable email')
    this.setState({ errorMessage }, () => this.setState({ isValid: this.state.errorMessage === '' }))
    return errorMessage === ''
  }

  checkErrorsSlow = debounce(this.checkErrors, 500)

  render() {
    const errorMessage = this.state.errorMessage || this.props.screenProps.error
    this.props.screenProps.error = undefined
    const { key } = this.props.navigation.state
    const { styles } = this.props

    return (
      <CustomWrapper
        valid={this.state.isValid}
        handleSubmit={this.handleSubmit}
        loading={this.props.screenProps.data.loading}
      >
        <Section.Stack grow justifyContent="flex-start" style={styles.row}>
          <Section.Row justifyContent="center">
            <Section.Title textTransform="none">
              {`Please enter your email,\n we will only notify you with important activity`}
            </Section.Title>
          </Section.Row>
          <Section.Row justifyContent="center" style={styles.row}>
            <InputText
              id={key + '_input'}
              value={this.state.email}
              onChangeText={this.handleChange}
              keyboardType="email-address"
              onKeyPress={this.handleEnter}
              error={errorMessage}
              onCleanUpField={this.handleChange}
              autoFocus
            />
          </Section.Row>
          <Section.Row justifyContent="flex-end" style={styles.bottomText}>
            <Section.Text fontFamily="regular" fontSize={14} color="gray80Percent">
              We respect your privacy and will never sell or give away your info to any third party
            </Section.Text>
          </Section.Row>
        </Section.Stack>
      </CustomWrapper>
    )
  }
}

const getStylesFromProps = ({ theme }) => ({
  bottomText: {
    marginTop: 'auto',
  },
  row: {
    marginVertical: theme.sizes.defaultQuadruple,
  },
})

export default withStyles(getStylesFromProps)(EmailForm)
