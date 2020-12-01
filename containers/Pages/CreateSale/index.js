import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Toast from 'light-toast';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import { Helmet } from 'react-helmet';
import { PapperBlock } from 'dan-components';
import brand from 'dan-api/dummy/brand';
import TextField from '@material-ui/core/TextField';
import { KeyboardDateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import LinearProgress from '@material-ui/core/LinearProgress';
import progressStyles from 'dan-styles/Progress.scss';
import classNames from 'classnames';
import Web3 from 'web3';
import {
  SALE_TOKEN_ADDRESS, 
  SALETOKENABI, 
  MAIN_DEP_ADDRESS,
  MAINDEPABI, 
  PRESALE_DEP_ADDRESS, 
  TEMPCROWDSALEABI, 
  TOKEN_DEP_ADDRESS, 
  TOKENDAPPABI,
  MAINTOKENABI,
} from '../../../ethContracts';


const styles = theme => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  demo: {
    height: 'auto',
  },
  divider: {
    margin: `${theme.spacing(3)}px 0`,
  },
  picker: {
    margin: `${theme.spacing(3)}px 5px`,
  },
  iconBtn: {
    top: theme.spacing(2)
  }
});

function getSteps() {
  return ['Token Name', 'Token Symbol', 'Team Tokens', 'Team Addresses', 'Presale Rate', 'Soft/Hard Cap', 'Contribution Limits', 'Uniswap Liquidity', 'Uniswap Rate', 'Governance Percentage', 'Additional Information'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return 'Enter the full name of your token below:';
    case 1:
      return 'Enter the token symbol for your token:';
    case 2:
      return 'Enter the token amounts to reserve for your team (For multiple amounts separate with commas and no spaces. For projects with no team tokens leave this blank)';
    case 3:
      return 'Enter the respective wallets the tokens from the previous step should be stored in (There must be as many addresses as token amounts from previous step, for multiple wallets seperate with commas and no spaces)';
    case 4:
      return 'Enter your presale price in ETH: (If I pay 1 ETH, how many tokens do I get?)';
    case 5:
      return 'Enter your desired softcap and hardcap: [soft,hard] (Must be whole numbers with no decimal places. For example soft cap cannot be 0.5 ETH it must be at least 1 ETH. Hardcap cannot be 10.5 ETH it must be 10 ETH)';
    case 6:
      return 'Enter the maximum and minimum amounts each wallet can contribute: (min,max)';
    case 7:
      return 'Enter the percentage of raised funds that should be allocated to Liquidity on Uniswap (Min 20%)';
    case 8:
      return 'Enter the uniswap listing price in ETH: (If I buy 1 ETH worth on Uniswap how many tokens do I get?)';
    case 9:
      return 'Enter the percentage of raised funds that will be locked in governance: (Type 0 if you want all funds up front with no governance, participants will be warned of no governance) These are a portion of your funds that will not be available right away and will require voting to release on the designated vote date';
    case 10:
      return 'Please enter the link to your edited copy of our Additional Information Google Sheet (In the header of this page). Make sure the sheet is published as a CSV (Copy the google sheet, edit it then in the top menu of google sheets click FILE > PUBLISH TO THE WEB - Change from Web Page to CSV > Click Publish > Copy Published Link';
    default:
      return 'Unknown step';
  }
}

function getStepInputLabel(step) {
  switch (step) {
    case 0:
      return 'Ex. DxSale';
    case 1:
      return 'Ex. SALE';
    case 2:
      return 'Ex. 20000,10000';
    case 3:
      return 'Ex. 0xd2628cf4eb8e24c56cc244f7435bf3e4a76c7554,0x4cdb52563c2c3fcdf37fca7911899a24f0b01325';
    case 4:
      return 'Ex. 500';
    case 5:
      return 'Ex. 50,100';
    case 6:
      return 'Ex. 0.1,10';
    case 7:
      return 'Ex. 60';
    case 8:
      return 'Ex. 400';
    case 9:
      return 'Ex. 50';
    case 10:
      return 'Ex. https://docs.google.com/spreadsheets/d/e/2PACX-1vT1bUAeasyxM4qxJ8_nsL-GJQY8ZgjkljlsA3XOxeds3llDjHHvmasdf2V0GimwIrlykc88K-pTLapuyW/pub?output=csv';
    default:
      return 'Unknown step';
  }
}


class VerticalStepper extends React.Component {
  state = {
    activeStep: 0,
    teamCounter: 0,
    currentValue: '',
    tokenName: '',
    tokenSymbol: '',
    reservedAmounts: '',
    reservedAddresses: '',
    presaleRate: '',
    presaleCaps: '',
    presaleMinMax: '',
    uniswapAmount: '',
    uniswapRate: '',
    infoLink: '',
    govRate: '',
    presaleStartTime: new Date(),
    presaleEndTime: new Date(),
    govStartTime: new Date(),
    govEndTime: new Date(),
    liqLockTime: new Date(),
    freezeTimes: [new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date()],
    web3connect: null,
    walletConnected: false,
    walletAddress: '',
    walletBalance: 0,
    deployerContract: null,
    presaleExists: false,
    tokenContract: null,
    tokenAddress: '0x',
    presaleContract: null,
    presaleAddress: '0x',
    currentRaised: 0,
    saleHardCap: 0,
  };

  componentDidMount() {
    this.connectWeb3();
  }

  async connectWeb3(showLoad) {
    var newWeb3 = null;
    var linkedAccount = null;
    var balance = 0;
    var newBalance = 0;
    if (window.ethereum) {
      newWeb3 = new Web3(window.ethereum);
      window.ethereum.enable();
      this.setState({ web3: newWeb3 });
      linkedAccount = await newWeb3.eth.getAccounts();
      if (linkedAccount == null || linkedAccount == '') {
        console.log('Not connected properly: ', linkedAccount);
        return 0;
      }
      if (linkedAccount[0].substr(0, 2) == '0x') {
        var network = await newWeb3.eth.net.getNetworkType();
        if (network == 'main') {
          this.setState({ walletNetwork: 'Mainnet' });
        } else {
          this.setState({ walletNetwork: 'Testnet: ' + network });
        }
        balance = await newWeb3.eth.getBalance(linkedAccount[0]);
        newBalance = (balance / 1000000000000000000).toFixed(4);
        const mainDepContract = new newWeb3.eth.Contract(MAINDEPABI, MAIN_DEP_ADDRESS);
        this.setState({ deployerContract: mainDepContract });
        this.setState({ walletAddress: linkedAccount[0] });
        this.setState({ walletConnected: true });
        this.setState({ walletBalance: newBalance });
        const saleStatus = await mainDepContract.methods.presales(linkedAccount[0]).call();
        this.setState({ presaleExists: saleStatus[0] });
        if (saleStatus[0]){
          //Collect presale information:
          this.setState({ tokenAddress: saleStatus[3] });
          const tokenDAPPContract = new newWeb3.eth.Contract(TOKENDAPPABI, TOKEN_DEP_ADDRESS);
          this.setState({ presaleAddress: saleStatus[4] });
          const mainTokenContract = new newWeb3.eth.Contract(MAINTOKENABI, saleStatus[3]); 
          const myTokenName = await mainTokenContract.methods.name().call();
          const myTokenSymbol = await mainTokenContract.methods.symbol().call();
          this.setState({ tokenName: myTokenName });
          this.setState({ tokenSymbol: myTokenSymbol });
          const tempCrowdContract = new newWeb3.eth.Contract(TEMPCROWDSALEABI, saleStatus[4]);
          const mySalesHardCap = await tempCrowdContract.methods.cap().call();
          const myTotalRaised = await tempCrowdContract.methods.CheckTotalEthRaised().call();
          this.setState({ saleHardCap: (mySalesHardCap/1000000000000000000) });
          this.setState({ currentRaised: myTotalRaised });
        }
      }
    } else if (window.web3) {
      var newWeb3 = null;
      var linkedAccount = null;
      var balance = 0;
      var newBalance = 0;
      newWeb3 = new Web3(window.web3.currentProvider);
      window.web3.enable();
      this.setState({ web3: newWeb3 });
      linkedAccount = await newWeb3.eth.getAccounts();
      if (linkedAccount == null || linkedAccount == '') {
        console.log('Not connected properly: ', linkedAccount);
        return 0;
      }
      if (linkedAccount[0].substr(0, 2) == '0x') {
        var network = await newWeb3.eth.net.getNetworkType();
        if (network == 'main') {
          this.setState({ walletNetwork: 'Mainnet' });
        } else {
          this.setState({ walletNetwork: 'Testnet: ' + network });
        }
        balance = await newWeb3.eth.getBalance(linkedAccount[0]);
        newBalance = (balance / 1000000000000000000).toFixed(4);
        const mainDepContract = new newWeb3.eth.Contract(MAINDEPABI, MAIN_DEP_ADDRESS);
        this.setState({ deployerContract: mainDepContract });
        this.setState({ walletAddress: linkedAccount[0] });
        this.setState({ walletConnected: true });
        this.setState({ walletBalance: newBalance });
        const saleStatus = await mainDepContract.methods.presales(linkedAccount[0]).call();
        this.setState({ presaleExists: saleStatus[0] });
      }
    } else {
      console.log('This is an unsupported browser!');
    }
  }

  handlePresaleStartTimeChange = (date) => {
    this.setState({ presaleStartTime: new Date(date) });
  }

  handlePresaleEndTimeChange = (date) => {
    this.setState({ presaleEndTime: new Date(date) });
  }

  handleGovStartTimeChange = (date) => {
    this.setState({ govStartTime: new Date(date) });
  }

  handleGovEndTimeChange = (date) => {
    this.setState({ govEndTime: new Date(date) });
  }

  handleLiqLockTimeChange = (date) => {
    this.setState({ liqLockTime: new Date(date) });
  }

  handleFreezeTimeChange = (date) => {
    const { freezeTimes } = this.state;
    const { teamCounter } = this.state;
    const myTimes = freezeTimes;
    const myCount = teamCounter;
    myTimes[myCount] = new Date(date);
    this.setState({ freezeTimes: myTimes });
    this.setState({
      teamCounter: teamCounter + 1,
    });
  }

  checkValidInputs() {
    const { activeStep } = this.state;
    const { tokenName } = this.state;
    const { tokenSymbol } = this.state;
    const { reservedAmounts } = this.state;
    const { reservedAddresses } = this.state;
    const { presaleRate } = this.state;
    const { presaleCaps } = this.state;
    const { presaleMinMax } = this.state;
    const { uniswapAmount } = this.state;
    const { uniswapRate } = this.state;
    const { infoLink } = this.state;
    const { govRate } = this.state;
    const { presaleStartTime } = this.state;
    const { presaleEndTime } = this.state;
    const { govStartTime } = this.state;
    const { govEndTime } = this.state;
    const { liqLockTime } = this.state;
    const { freezeTimes } = this.state;

    if (activeStep == 0 && tokenName == '') {
      alert("Token Name can't be empty. Please update it before proceeding!");
      return true;
    }
    if (activeStep == 1 && tokenSymbol == '') {
      alert("Token Symbol can't be empty. Please update it before proceeding!");
      return true;
    }
    if (activeStep == 3) {
      const numOfTeamWallets = reservedAmounts.split(',').length;
      const numOfTeamAddresses = reservedAddresses.split(',').length;
      if (numOfTeamAddresses != numOfTeamWallets) {
        alert('You have ' + numOfTeamWallets + ' team token amount(s). You must also have the same number of team addresses! Please update before proceeding.');
        return true;
      }
      if (reservedAmounts != '') {
        if (reservedAddresses == '') {
          alert("You specified tokens for a team wallet but didn't designate an address for those tokens.");
          return true;
        }
        const myAddresses = reservedAddresses.split(',');
        const myLength = reservedAddresses.split(',').length;
        var i;
        if (myLength != 0) {
          for (i = 0; i < myLength; i++) {
            if (myAddresses[i].length != 42) {
              alert('Your team address #' + (i + 1) + ' is an invalid Ethereum Address!');
              return true;
            }
            if (myAddresses[i].substr(0, 2) != '0x') {
              alert('Your team address #' + (i + 1) + " is an invalid Ethereum Address! ETH addresses stat with '0x'");
              return true;
            }
          }
        }
      } else if (reservedAmounts == '' && reservedAddresses != '') {
        alert('You entered an address but no team amounts, please enter a team amount in order to enter an address or clear the address field!');
        return true;
      }
    }
    if (activeStep == 4) {
      const saleRate = parseFloat(presaleRate);
      if (isNaN(saleRate)) {
        alert('Presale rate must be a valid number. Please fix it to proceed.');
        return true;
      }
      if (saleRate <= 0) {
        alert("Presale rate can't be 0 or a negative number. Please fix it to proceed.");
        return true;
      }
    }
    if (activeStep == 5) {
      const softCap = parseFloat(presaleCaps.split(',')[0]);
      const hardCap = parseFloat(presaleCaps.split(',')[1]);
      if (isNaN(softCap) || isNaN(hardCap)) {
        alert('One of your soft or hard caps is not a valid number, please correct it!');
        return true;
      }
      if (softCap < 1 || softCap == '' || !( softCap % 1 === 0 )) {
        alert('Your soft cap is not set correctly it must be a positive integer greater than or equal to 1. Please fix to proceed.');
        return true;
      }
      if (hardCap <= 0 || hardCap == '' || !( softCap % 1 === 0 )) {
        alert("Your hard cap can't be 0, negative or empty! It must also be a whole number! Please fix to proceed");
        return true;
      }
      if (hardCap <= softCap) {
        alert('Hard cap must be higher than soft cap. Please fix to proceed');
        return true;
      }
    }
    if (activeStep == 6) {
      const saleMin = parseFloat(presaleMinMax.split(',')[0]);
      const saleMax = parseFloat(presaleMinMax.split(',')[1]);
      if (isNaN(saleMin) || isNaN(saleMax)) {
        alert('One of your contribution limit amounts is not a number! Please correct it.');
        return true;
      }
      if (saleMin < 0 || saleMin == '') {
        alert('Your minimum contribution limit is not set correctly, it must be a number greater than 0.');
        return true;
      }
      if (saleMax <= 0 || saleMax == '') {
        alert('Your maximum contribution limit must be a number greater than 0. Please correct it to proceed. For no max limit set to 99999');
        return true;
      }
      if (saleMin > saleMax) {
        alert('The minimum contribution limit cannot be higher than max limit. For equal amounts put the same number Ex. 0.5,0.5');
        return true;
      }
    }
    if (activeStep == 7) {
      const uniswapLiq = parseFloat(uniswapAmount);
      if (isNaN(uniswapLiq)) {
        alert('The liquidity amount needs to be a number >= 20!');
        return true;
      }
      if (uniswapLiq < 20) {
        alert('The liquidity amount needs to be a number >= 20!');
        return true;
      }
    }
    if (activeStep == 8) {
      const rateForUniswap = parseFloat(uniswapRate);
      if (isNaN(rateForUniswap)) {
        alert('The uniswap listing price must be a number > 0');
        return true;
      }
      if (rateForUniswap <= 0) {
        alert('The uniswap listing price cannot be 0 or less!');
        return true;
      }
    }
    if (activeStep == 9) {
      const goverAmount = parseFloat(govRate);
      const uniswapLiqs = parseFloat(uniswapAmount);
      if (isNaN(goverAmount)) {
        alert("The governance amount needs to be a number, if you don't want governance set this to 0!");
        return true;
      }
      if ((goverAmount + uniswapLiqs) > 100) {
        alert('The sum of governance and uniswap liquidity amounts cannot exceed 100%');
        return true;
      }
    }
    if (activeStep == 10 && infoLink == '') {
      alert('The google sheets link cannot be empty!');
      return true;
    }
    if (activeStep == 11) {
      if (parseFloat(presaleEndTime.getTime() / 1000) <= parseFloat(presaleStartTime.getTime() / 1000)) {
        alert('Presale end time must be greater than presale start time!');
        return true;
      }
      if (govRate > 0) {
        if (parseFloat(govEndTime.getTime() / 1000) <= parseFloat(parseFloat(govStartTime.getTime() / 1000) + 86400)) {
          alert('Governance end time must be at least 24 hours after governance start time!');
          return true;
        }
      }
      if (parseFloat(liqLockTime.getTime() / 1000) <= parseFloat((parseFloat(presaleEndTime.getTime() / 1000) + 7776000))) {
        alert('Liquidity Lock time must be at least 3 months after Presale End Time!');
        return true;
      }
      if (reservedAmounts.length != 0 && reservedAmounts != '') {
        const totalLength = freezeTimes.length;
        for (var i; i < totalLength; i++) {
          if (parseFloat(freezeTimes[i].getTime() / 1000) < parseFloat(presaleEndTime.getTime() / 1000)) {
            alert('Freeze time for team funds #' + (i + 1) + ' must be longer than or equal to presale end time');
            return true;
          }
        }
      }
    }
    return false;
  }

  handleNext = () => {
    const { activeStep } = this.state;

    if (this.checkValidInputs()) {
      return 0;
    }

    this.setState({
      activeStep: activeStep + 1,
    });
    const myStep = activeStep + 1;
    this.setState({
      currentValue: ''
    });
    this.handleValueUpdate(myStep);
  };

  handleBack = () => {
    const { activeStep } = this.state;
    const myStep = activeStep - 1;
    this.setState({
      activeStep: activeStep - 1,
    });
    this.setState({
      currentValue: ''
    });
    this.handleValueUpdate(myStep);
  };

  setActiveStep(newStep) {
    const { activeStep } = this.state;

    if (this.checkValidInputs()) {
      return 0;
    }

    this.setState({
      activeStep: newStep,
    });
    this.setState({
      currentValue: ''
    });
    this.handleValueUpdate(newStep);
  }

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
    this.setState({
      currentValue: ''
    });
    this.handleValueUpdate(0);
  };

  handleSubmit = () => {
    const { tokenName } = this.state;
    const { tokenSymbol } = this.state;
    const { reservedAmounts } = this.state;
    const { reservedAddresses } = this.state;
    const { presaleRate } = this.state;
    const { presaleCaps } = this.state;
    const { presaleMinMax } = this.state;
    const { uniswapAmount } = this.state;
    const { uniswapRate } = this.state;
    const { infoLink } = this.state;
    const { govRate } = this.state;
    const { presaleStartTime } = this.state;
    const { presaleEndTime } = this.state;
    const { govStartTime } = this.state;
    const { govEndTime } = this.state;
    const { liqLockTime } = this.state;
    const { freezeTimes } = this.state;
    const { walletAddress } = this.state;
    const { deployerContract } = this.state;

    let readyToSubmit = true;

    let activeStep;
    for (activeStep = 0; activeStep < 12; activeStep++) {
      if (activeStep == 0 && tokenName == '') {
        alert("Token Name can't be empty. Please update it before proceeding!");
        readyToSubmit = false;
      }
      if (activeStep == 1 && tokenSymbol == '') {
        console.log('Hello world this is step 2');
        alert("Token Symbol can't be empty. Please update it before proceeding!");
        readyToSubmit = false;
      }
      if (activeStep == 3) {
        const numOfTeamWallets = reservedAmounts.split(',').length;
        const numOfTeamAddresses = reservedAddresses.split(',').length;
        if (numOfTeamAddresses != numOfTeamWallets) {
          alert('You have ' + numOfTeamWallets + ' team token amount(s). You must also have the same number of team addresses! Please update before proceeding.');
          readyToSubmit = false;
        } else if (reservedAmounts != '') {
          if (reservedAddresses == '') {
            alert("You specified tokens for a team wallet but didn't designate an address for those tokens.");
            readyToSubmit = false;
          }
          const myAddresses = reservedAddresses.split(',');
          const myLength = reservedAddresses.split(',').length;
          var i;
          if (myLength != 0) {
            for (i = 0; i < myLength; i++) {
              if (myAddresses[i].length != 42) {
                alert('Your team address #' + (i + 1) + ' is an invalid Ethereum Address!');
                readyToSubmit = false;
              } else if (myAddresses[i].substr(0, 2) != '0x') {
                alert('Your team address #' + (i + 1) + " is an invalid Ethereum Address! ETH addresses stat with '0x'");
                readyToSubmit = false;
              }
            }
          }
        } else if (reservedAmounts == '' && reservedAddresses != '') {
          alert('You entered an address but no team amounts, please enter a team amount in order to enter an address or clear the address field!');
          readyToSubmit = false;
        }
      }
      if (activeStep == 4) {
        const saleRate = parseFloat(presaleRate);
        if (isNaN(saleRate)) {
          alert('Presale rate must be a valid number. Please fix it to proceed.');
          readyToSubmit = false;
        }
        if (saleRate <= 0) {
          alert("Presale rate can't be 0 or a negative number. Please fix it to proceed.");
          readyToSubmit = false;
        }
      }
      if (activeStep == 5) {
        const softCap = parseFloat(presaleCaps.split(',')[0]);
        const hardCap = parseFloat(presaleCaps.split(',')[1]);
        if (isNaN(softCap) || isNaN(hardCap)) {
          alert('One of your soft or hard caps is not a valid number, please correct it!');
          readyToSubmit = false;
        }
        if (softCap < 0.001 || softCap == '') {
          alert('Your soft cap is not set correctly it must be a positive number greater than or equal to 0.001. Please fix to proceed.');
          readyToSubmit = false;
        }
        if (hardCap <= 0 || hardCap == '') {
          alert("Your hard cap can't be 0, negative or empty! Please fix to proceed");
          readyToSubmit = false;
        }
        if (hardCap <= softCap) {
          alert('Hard cap must be higher than soft cap. Please fix to proceed');
          readyToSubmit = false;
        }
      }
      if (activeStep == 6) {
        const saleMin = parseFloat(presaleMinMax.split(',')[0]);
        const saleMax = parseFloat(presaleMinMax.split(',')[1]);
        if (isNaN(saleMin) || isNaN(saleMax)) {
          alert('One of your contribution limit amounts is not a number! Please correct it.');
          readyToSubmit = false;
        }
        if (saleMin < 0 || saleMin == '') {
          alert('Your minimum contribution limit is not set correctly, it must be a number greater than 0.');
          readyToSubmit = false;
        }
        if (saleMax <= 0 || saleMax == '') {
          alert('Your maximum contribution limit must be a number greater than 0. Please correct it to proceed. For no max limit set to 99999');
          readyToSubmit = false;
        }
        if (saleMin > saleMax) {
          alert('The minimum contribution limit cannot be higher than max limit. For equal amounts put the same number Ex. 0.5,0.5');
          readyToSubmit = false;
        }
      }
      if (activeStep == 7) {
        const uniswapLiq = parseFloat(uniswapAmount);
        if (isNaN(uniswapLiq)) {
          alert('The liquidity amount needs to be a number >= 20!');
          readyToSubmit = false;
        }
        if (uniswapLiq < 20) {
          alert('The liquidity amount needs to be a number >= 20!');
          readyToSubmit = false;
        }
      }
      if (activeStep == 8) {
        const rateForUniswap = parseFloat(uniswapRate);
        if (isNaN(rateForUniswap)) {
          alert('The uniswap listing price must be a number > 0');
          readyToSubmit = false;
        }
        if (rateForUniswap <= 0) {
          alert('The uniswap listing price cannot be 0 or less!');
          readyToSubmit = false;
        }
      }
      if (activeStep == 9) {
        const goverAmount = parseFloat(govRate);
        const uniswapLiqs = parseFloat(uniswapAmount);
        if (isNaN(goverAmount)) {
          alert("The governance amount needs to be a number, if you don't want governance set this to 0!");
          readyToSubmit = false;
        }
        if ((goverAmount + uniswapLiqs) > 100) {
          alert('The sum of governance and uniswap liquidity amounts cannot exceed 100%');
          readyToSubmit = false;
        }
      }
      if (activeStep == 10 && infoLink == '') {
        alert('The google sheets ID cannot be empty!');
        readyToSubmit = false;
      }
      if (activeStep == 11) {
        if (parseFloat(presaleEndTime.getTime() / 1000) <= parseFloat(presaleStartTime.getTime() / 1000)) {
          alert('Presale end time must be greater than presale start time!');
          readyToSubmit = false;
        }
        if (govRate > 0) {
          if (parseFloat(govEndTime.getTime() / 1000) <= parseFloat(parseFloat(govStartTime.getTime() / 1000) + 86400)) {
            alert('Governance end time must be at least 24 hours after governance start time!');
            readyToSubmit = false;
          }
        }
        if (parseFloat(liqLockTime.getTime() / 1000) <= parseFloat((parseFloat(presaleEndTime.getTime() / 1000) + 7776000))) {
          alert('Liquidity Lock time must be at least 3 months after Presale End Time!');
          readyToSubmit = false;
        }
        if (reservedAmounts.length != 0 && reservedAmounts != '') {
          const totalLength = reservedAddresses.split(',').length;
          for (var i; i < totalLength; i++) {
            if (parseFloat(freezeTimes[i].getTime() / 1000) < parseFloat(presaleEndTime.getTime() / 1000)) {
              alert('Freeze time for team funds #' + (i + 1) + ' must be longer than or equal to presale end time');
              readyToSubmit = false;
            }
          }
        }
      }
    }

    // If all checks passed submit presale information to the blockchain
    if (readyToSubmit) {
      const tokenInfo = [('' + tokenName), ('' + tokenSymbol), ('' + infoLink)]; // ["name", "symbol", "link"]

      // Set times to UTC
      const preStTime = (presaleStartTime.getTime()) / 1000;
      const preEnTime = (presaleEndTime.getTime()) / 1000;
      var presaleGovTimes = [0, 0, 0, 0];
      if (govRate > 0){
        const govStTime = (govStartTime.getTime()) / 1000;
        const govEnTime = (govEndTime.getTime()) / 1000;
        presaleGovTimes = [preStTime, preEnTime, govStTime, govEnTime]; // ["presale_start", "presale_end", "gov_start", "gov_end"]
      }else{
        presaleGovTimes = [preStTime, preEnTime, (preEnTime+9000000), (preEnTime+9500000)];
      }
      const presaleMetrics = [(presaleCaps.split(',')[0]*1), (presaleCaps.split(',')[1]*1), (presaleRate*1), ('' + (presaleMinMax.split(',')[0]*1000000000000000000)), ('' + (presaleMinMax.split(',')[1]*1000000000000000000)), (govRate*1)]; // ["softCap", "hardCap", "presaleRate", "minContribution", "maxContribution", "%fundsToGov"]

      const uniUnlockTime = (liqLockTime.getTime()) / 1000;
      const uniswapMetrics = [uniUnlockTime, (uniswapRate*1), (uniswapAmount*1)]; // ["unlockTimeUTC", "uniswapRate", "%fundsToUni"]

      var xTeamAddresses = []; // ["address1", "address2"]
      var xTeamAmounts = []; // ["amount1", "amount2"]
      var xTeamFreezeTime = []; // ["freeze1", "freeze2"]
      if (reservedAddresses == '' && reservedAmounts == ''){
        xTeamAddresses.push('0x0000000000000000000000000000000000000000');
        xTeamAmounts.push(0);
        xTeamFreezeTime.push(0);
      }
      else{
        const numOfTeamWalletsX = reservedAmounts.split(',').length;
        let i;
        for (i = 0; i < numOfTeamWalletsX; i++) {
          xTeamAddresses.push(reservedAddresses.split(',')[i]);
          xTeamAmounts.push(reservedAmounts.split(',')[i]);
          const thisFreezeTime = (freezeTimes[i].getTime()) / 1000;
          xTeamFreezeTime.push(thisFreezeTime*1);
        }
      }

      console.log('Token Info is ' + tokenInfo);
      console.log('Timings are ' + presaleGovTimes);
      console.log('Metrics are ' + presaleMetrics);
      console.log('Uniswap data is ' + uniswapMetrics);
      console.log('Team Addresses are ' + xTeamAddresses);
      console.log('Team Amounts are ' + xTeamAmounts);
      console.log('Team freeze times are ' + xTeamFreezeTime);

      // Send data to blockchain
      deployerContract.methods.CreatePresaleDep(tokenInfo, presaleGovTimes, presaleMetrics, uniswapMetrics, xTeamAddresses, xTeamAmounts, xTeamFreezeTime).send({ from: walletAddress })
        .on('transactionHash', (receipt) => {
          console.log("Transaction started! " + receipt);
        })
        .on('error', (error) => {
          console.log("Transaction Failed: " + error);          
        })
        .once('receipt', (receipt) => {
          console.log("Transaction complete! " + receipt);
        });
      console.log("Let's go! Time to roll!");
    }
  }

  handleValueUpdate(step) {
    const { tokenName } = this.state;
    const { tokenSymbol } = this.state;
    const { reservedAmounts } = this.state;
    const { reservedAddresses } = this.state;
    const { presaleRate } = this.state;
    const { presaleCaps } = this.state;
    const { presaleMinMax } = this.state;
    const { uniswapAmount } = this.state;
    const { uniswapRate } = this.state;
    const { infoLink } = this.state;
    const { govRate } = this.state;
    switch (step) {
      case 0:
        this.setState({
          currentValue: tokenName
        });
        break;
      case 1:
        this.setState({
          currentValue: tokenSymbol
        });
        break;
      case 2:
        this.setState({
          currentValue: reservedAmounts
        });
        break;
      case 3:
        this.setState({
          currentValue: reservedAddresses
        });
        break;
      case 4:
        this.setState({
          currentValue: presaleRate
        });
        break;
      case 5:
        this.setState({
          currentValue: presaleCaps
        });
        break;
      case 6:
        this.setState({
          currentValue: presaleMinMax
        });
        break;
      case 7:
        this.setState({
          currentValue: uniswapAmount
        });
        break;
      case 8:
        this.setState({
          currentValue: uniswapRate
        });
        break;
      case 9:
        this.setState({
          currentValue: govRate
        });
        break;
      case 10:
        this.setState({
          currentValue: infoLink
        });
        break;
      default:
        break;
    }
  }

  handleInputUpdate() {
    const { activeStep } = this.state;
    const myStep = activeStep;
    switch (myStep) {
      case 0:
        this.setState({
          tokenName: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 1:
        this.setState({
          tokenSymbol: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 2:
        this.setState({
          reservedAmounts: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 3:
        this.setState({
          reservedAddresses: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 4:
        this.setState({
          presaleRate: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 5:
        this.setState({
          presaleCaps: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 6:
        this.setState({
          presaleMinMax: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 7:
        this.setState({
          uniswapAmount: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 8:
        this.setState({
          uniswapRate: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 9:
        this.setState({
          govRate: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      case 10:
        this.setState({
          infoLink: event.target.value
        });
        this.setState({
          currentValue: event.target.value
        });
        break;
      default:
        break;
    }
  }

  numberToMonth(value) {
    if (value == 0) return 'JAN';
    if (value == 1) return 'FEB';
    if (value == 2) return 'MAR';
    if (value == 3) return 'APR';
    if (value == 4) return 'MAY';
    if (value == 5) return 'JUN';
    if (value == 6) return 'JUL';
    if (value == 7) return 'AUG';
    if (value == 8) return 'SEP';
    if (value == 9) return 'OCT';
    if (value == 10) return 'NOV';
    return 'DEC';
  }

  calculateDate(dateValue) {
    let hour = dateValue.getHours();
    if (hour < 10) {
      hour = '0' + hour;
    }
    let minute = dateValue.getMinutes();
    if (minute < 10) {
      minute = '0' + minute;
    }
    const day = dateValue.getDate();
    const month = this.numberToMonth(dateValue.getMonth());
    const year = dateValue.getFullYear();
    return day + ' ' + month + ' ' + year + ' at ' + hour + ':' + minute;
  }

  render() {
    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep } = this.state;
    const { teamCounter } = this.state;
    const { currentValue } = this.state;
    const { tokenName } = this.state;
    const { tokenSymbol } = this.state;
    const { reservedAmounts } = this.state;
    const { reservedAddresses } = this.state;
    const { presaleRate } = this.state;
    const { presaleCaps } = this.state;
    const { presaleMinMax } = this.state;
    const { uniswapAmount } = this.state;
    const { uniswapRate } = this.state;
    const { presaleStartTime } = this.state;
    const { presaleEndTime } = this.state;
    const { govStartTime } = this.state;
    const { govEndTime } = this.state;
    const { liqLockTime } = this.state;
    const { freezeTimes } = this.state;
    const { infoLink } = this.state;
    const { govRate } = this.state;
    const { web3connect } = this.state;
    const { walletAddress } = this.state;
    const { walletConnected } = this.state;
    const { walletBalance } = this.state;
    const { walletNetwork } = this.state;
    const { presaleExists } = this.state;
    const { presaleAddress } = this.state;
    const { tokenAddress } = this.state;
    const { saleHardCap } = this.state;
    const { currentRaised } = this.state;

    const title = brand.name + ' - Create your own presale';
    const description = brand.desc;

    return (
      <div className={classes.root}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="twitter:title" content={title} />
          <meta property="twitter:description" content={description} />
        </Helmet>
        {!presaleExists
          ? (
            <div>
              <Paper elevation={3} style={{ paddingTop: '8px', paddingBottom: '8px', marginBottom: '20px' }}>
                {walletConnected
                  ? (
                    <Grid container>
                      <Grid item md={3} container direction="column" alignItems="center" justify="center">
                        <Typography align="center">Network</Typography>
                        <Chip style={{ width: '150px' }} color="primary" label={'' + walletNetwork} />
                      </Grid>
                      <Grid item md={6} container direction="column" alignItems="center" justify="center">
                        <Typography align="center">Wallet</Typography>
                        <Chip style={{ width: '150px' }} color="primary" label={('' + walletAddress + '').substr(0, 6) + '...' + ('' + walletAddress + '').substr((('' + walletAddress + '').length - 4), ('' + walletAddress + '').length)} />
                      </Grid>
                      <Grid item md={3} container direction="column" alignItems="center" justify="center">
                        <Typography align="center">ETH Balance</Typography>
                        <Chip style={{ width: '150px' }} color="primary" label={walletBalance + ' ETH'} />
                      </Grid>
                    </Grid>
                  )
                  : (
                    <Grid container>
                      <Grid item md={3} container direction="column" alignItems="center" justify="center" />
                      <Grid item md={6} container direction="column" alignItems="center" justify="center">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => this.connectWeb3()}
                        >
                  Connect Wallet to Start
                        </Button>
                      </Grid>
                      <Grid item md={3} container direction="column" alignItems="center" justify="center" />
                    </Grid>
                  )
                }
              </Paper>
              <PapperBlock title="Create Presale" desc="Get started in just a few simple steps!" icon="ios-clipboard">
                {walletConnected
                  ? (
                    <div>
              Disclaimer: This process is entirely decentralized, we cannot be held reponsible for incorrect entry of information. Please ensure you enter all your details to the best accuracy possible.
                      <br />
Also please note this is an alpha version and has been tested thoroughly by our team, but we cannot guarantee there will be no bugs. Use at your own risk!
                      <br />
                      <br />
Please also copy and edit the following
                      {' '}
                      <a href="https://docs.google.com/spreadsheets/d/1SiT69_cr4QE2QRBA1v2W0Mk37p5CU3dRURxjkPA-czE/edit?usp=sharing" target="_blank">Google Sheet</a>
                      {' '}
in order to share it in one of the input sections below.
                    </div>
                  )
                  : (
                    <div>
              Awaiting Wallet Connection...
                    </div>
                  )
                }
              </PapperBlock>
              {walletConnected
                ? (
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel><a onClick={() => this.setActiveStep(index)} style={{ textDecoration: 'none', color: 'primary' }}>{label}</a></StepLabel>
                        <StepContent>
                          <Typography>{getStepContent(index)}</Typography>
                          <br />
                          <TextField
                            placeholder={getStepInputLabel(index)}
                            id="saleInfoInput"
                            fullWidth
                            onChange={() => this.handleInputUpdate()}
                            color="primary"
                            value={this.state.currentValue}
                            inputProps={{
                              autoComplete: 'off'
                            }}
                          />
                          <div className={classes.actionsContainer}>
                            <br />
                            <div>
                              <Button
                                disabled={activeStep === 0}
                                onClick={this.handleBack}
                                className={classes.button}
                              >
                      Back
                              </Button>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleNext}
                                className={classes.button}
                              >
                      Next
                              </Button>
                            </div>
                          </div>
                        </StepContent>
                      </Step>
                    ))}
                    <Step key={12}>
                      <StepLabel><a onClick={() => this.setActiveStep(11)} style={{ textDecoration: 'none', color: 'primary' }}>Timings</a></StepLabel>
                      <StepContent>
                        <Typography>Please set the start and end time for the following parameters!</Typography>
                        <div className={classes.picker}>
                          <Typography>Presale Start/End Time</Typography>
                          <MuiPickersUtilsProvider utils={MomentUtils}>
                            <KeyboardDateTimePicker
                              label="Presale Start Time"
                              value={presaleStartTime}
                              onChange={this.handlePresaleStartTimeChange}
                              format="YYYY/MM/DD hh:mm A"
                              mask={[/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ' ', /a|p/i, 'M']}
                            />
                          </MuiPickersUtilsProvider>
                          <MuiPickersUtilsProvider utils={MomentUtils}>
                            <KeyboardDateTimePicker
                              label="Presale End Time"
                              value={presaleEndTime}
                              onChange={this.handlePresaleEndTimeChange}
                              format="YYYY/MM/DD hh:mm A"
                              mask={[/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ' ', /a|p/i, 'M']}
                            />
                          </MuiPickersUtilsProvider>
                          <br />
                          <br />
                          <Typography>Liquidity Lockup Time</Typography>
                          <MuiPickersUtilsProvider utils={MomentUtils}>
                            <KeyboardDateTimePicker
                              label="Liquidity Unlock Time"
                              value={liqLockTime}
                              onChange={this.handleLiqLockTimeChange}
                              format="YYYY/MM/DD hh:mm A"
                              mask={[/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ' ', /a|p/i, 'M']}
                            />
                          </MuiPickersUtilsProvider>
                          { (parseFloat(govRate) > 0)
                            ? (
                              <div>
                                <br />
                                <Typography>Start and End time for Governance voting to Release Funds (Must be 24 hours apart at minimum)</Typography>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                  <KeyboardDateTimePicker
                                    label="Governance Start Time"
                                    value={govStartTime}
                                    onChange={this.handleGovStartTimeChange}
                                    format="YYYY/MM/DD hh:mm A"
                                    mask={[/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ' ', /a|p/i, 'M']}
                                  />
                                </MuiPickersUtilsProvider>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                  <KeyboardDateTimePicker
                                    label="Governance End Time"
                                    value={govEndTime}
                                    onChange={this.handleGovEndTimeChange}
                                    format="YYYY/MM/DD hh:mm A"
                                    mask={[/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ' ', /a|p/i, 'M']}
                                  />
                                </MuiPickersUtilsProvider>
                                <br />
                              </div>
                            )
                            : null}
                          {
                            (reservedAmounts.includes(','))
                              ? (
                                <div>
                                  <br />
                                  <Typography>Team Funds Freeze Time</Typography>
                                  {reservedAmounts.split(',').map((m, n) => ([
                                    <MuiPickersUtilsProvider utils={MomentUtils} key={n}>
                                      <KeyboardDateTimePicker
                                        label={'Freeze Time for Team Wallet #' + (n + 1)}
                                        value={freezeTimes[n]}
                                        onChange={this.handleFreezeTimeChange}
                                        format="YYYY/MM/DD hh:mm A"
                                        mask={[/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ' ', /a|p/i, 'M']}
                                      />
                                    </MuiPickersUtilsProvider>
                                  ]))}
                                </div>
                              )
                              : (
                                <div>
                                  {reservedAmounts > 0
                                    ? (
                                      <div>
                                        <br />
                                        <Typography>Team Funds Freeze Time</Typography>
                                        <MuiPickersUtilsProvider utils={MomentUtils}>
                                          <KeyboardDateTimePicker
                                            label="Freeze time for Team Tokens"
                                            value={freezeTimes[0]}
                                            onChange={this.handleFreezeTimeChange}
                                            format="YYYY/MM/DD hh:mm A"
                                            mask={[/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ' ', /a|p/i, 'M']}
                                          />
                                        </MuiPickersUtilsProvider>
                                      </div>
                                    )
                                    : null}
                                </div>
                              )
                          }
                        </div>
                        <br />
                        <Button
                          onClick={this.handleBack}
                          className={classes.button}
                        >
                Back
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={this.handleNext}
                          className={classes.button}
                        >
                Finish
                        </Button>
                      </StepContent>
                    </Step>
                    <Step key={13}>
                      <StepLabel><a onClick={() => this.setActiveStep(12)} style={{ textDecoration: 'none', color: 'primary' }}>Finalize</a></StepLabel>
                    </Step>
                  </Stepper>
                )
                : null
              }
              <br/>
              {activeStep === steps.length + 1 && (
                <Paper elevation={0} className={classes.resetContainer}>
                  <Typography>Review your details below then press submit to create your presale on the DxSale deployer! Or press edit to go back and edit information. Warning: once submitted this information can never be changed!</Typography>
                  <div className={classes.rootTable}>
                    <Table className={classNames(classes.table, classes.stripped)}>
                      <TableBody>
                        <TableRow>
                          <TableCell>Token Name</TableCell>
                          <TableCell>{tokenName}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          <TableCell>Token Symbol</TableCell>
                          <TableCell>{tokenSymbol}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                        {
                          (reservedAmounts.includes(','))
                            ? reservedAmounts.split(',').map((m, n) => ([
                              <TableRow key={n}>
                                <TableCell>{'Team Tokens #' + (n + 1)}</TableCell>
                                <TableCell>{'Balance: ' + m}</TableCell>
                                <TableCell>{'Addr: ' + reservedAddresses.split(',')[n].substr(0, 6) + '...' + reservedAddresses.split(',')[n].substr(reservedAddresses.split(',')[n].length - 4)}</TableCell>
                                <TableCell>{'Unlocks: ' + this.calculateDate(freezeTimes[n])}</TableCell>
                              </TableRow>
                            ]))
                            : reservedAmounts > 0
                              ? (
                                <TableRow>
                                  <TableCell>Team Tokens</TableCell>
                                  <TableCell>{reservedAmounts[0]}</TableCell>
                                  <TableCell>{'Addr: ' + reservedAddresses.substr(0, 6) + '...' + reservedAddresses.substr(reservedAddresses.length - 4)}</TableCell>
                                  <TableCell>{'Unlocks: ' + this.calculateDate(freezeTimes[0])}</TableCell>
                                </TableRow>
                              )
                              : null
                        }
                        <TableRow>
                          <TableCell>Presale Rate (Per ETH)</TableCell>
                          <TableCell>{presaleRate + ' ' + tokenSymbol}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          <TableCell>Soft/Hard Caps (ETH)</TableCell>
                          <TableCell>{'Soft Cap: ' + presaleCaps.split(',')[0]}</TableCell>
                          <TableCell>{'Hard Cap: ' + presaleCaps.split(',')[1]}</TableCell>
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          <TableCell>Contribution Limits (ETH)</TableCell>
                          <TableCell>{'Min: ' + presaleMinMax.split(',')[0]}</TableCell>
                          <TableCell>{'Max: ' + presaleMinMax.split(',')[1]}</TableCell>
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          <TableCell>Presale Timings</TableCell>
                          <TableCell />
                          <TableCell>{'Starts: ' + this.calculateDate(presaleStartTime)}</TableCell>
                          <TableCell>{'Ends: ' + this.calculateDate(presaleEndTime)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Uniswap Liquidity</TableCell>
                          <TableCell>{uniswapAmount + '%'}</TableCell>
                          <TableCell />
                          <TableCell>{'Unlocks: ' + this.calculateDate(liqLockTime)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Uniswap Rate (Per ETH)</TableCell>
                          <TableCell>{uniswapRate + ' ' + tokenSymbol}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                        {(govRate > 0)
                          ? (
                            <span>
                              <TableRow>
                                <TableCell>ETH locked for Gov</TableCell>
                                <TableCell>{govRate + '%'}</TableCell>
                                <TableCell />
                                <TableCell />
                              </TableRow>
                              <TableRow>
                                <TableCell>Governance Voting</TableCell>
                                <TableCell />
                                <TableCell>{'Starts: ' + this.calculateDate(govStartTime)}</TableCell>
                                <TableCell>{'Ends: ' + this.calculateDate(govEndTime)}</TableCell>
                              </TableRow>
                            </span>
                          )
                          : null
                        }
                      </TableBody>
                    </Table>
                  </div>
                  <Button onClick={this.handleReset} className={classes.button}>
              Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.handleSubmit}
                    className={classes.button}
                  >
              Submit
                  </Button>
                </Paper>
              )}
            </div>
          )
          : (
            <div>
              <Paper elevation={3} style={{ paddingTop: '8px', paddingBottom: '8px', marginBottom: '20px' }}>
                {walletConnected
                  ? (
                    <Grid container>
                      <Grid item md={3} container direction="column" alignItems="center" justify="center">
                        <Typography align="center">Network</Typography>
                        <Chip style={{ width: '150px' }} color="primary" label={'' + walletNetwork} />
                      </Grid>
                      <Grid item md={6} container direction="column" alignItems="center" justify="center">
                        <Typography align="center">Wallet</Typography>
                        <Chip style={{ width: '150px' }} color="primary" label={('' + walletAddress + '').substr(0, 6) + '...' + ('' + walletAddress + '').substr((('' + walletAddress + '').length - 4), ('' + walletAddress + '').length)} />
                      </Grid>
                      <Grid item md={3} container direction="column" alignItems="center" justify="center">
                        <Typography align="center">ETH Balance</Typography>
                        <Chip style={{ width: '150px' }} color="primary" label={walletBalance + ' ETH'} />
                      </Grid>
                    </Grid>
                  )
                  : (
                    <Grid container>
                      <Grid item md={3} container direction="column" alignItems="center" justify="center" />
                      <Grid item md={6} container direction="column" alignItems="center" justify="center">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => this.connectWeb3()}
                        >
                  Connect Wallet to Start
                        </Button>
                      </Grid>
                      <Grid item md={3} container direction="column" alignItems="center" justify="center" />
                    </Grid>
                  )
                }
              </Paper>
              <PapperBlock title='Manage Presale' desc='Manage settings for your existing presale!' icon="ios-clipboard">
                <Typography>Here is a summary of your presale:</Typography>
                <br/>
                <Typography align="center">{currentRaised + '/' + saleHardCap + ' ETH Raised'}</Typography>
                <LinearProgress variant="determinate" className={progressStyles.bgInfo} value={((currentRaised/saleHardCap)*100)} />
                <br/> 
                Name: {tokenName} <br/>
                Symbol: {tokenSymbol} <br/>
                Presale Address: {'' + presaleAddress}<br/>
                Token Address: {'' + tokenAddress}<br/>
                Sale ID: <br/>
                Status: Presale Active <br/>
                <br/>
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => this.connectWeb3()}>
                    Call Finalize
                </Button>
              </PapperBlock> <br/>
            </div>
          )
        }
      </div>
    );
  }
}

VerticalStepper.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(VerticalStepper);
