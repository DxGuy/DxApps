import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import brand from '../../../api/dummy/brand';
import { PapperBlock } from 'dan-components';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import styles from 'dan-components/Tables/tableStyle-jss';
import LinearProgress from '@material-ui/core/LinearProgress';
import progressStyles from 'dan-styles/Progress.scss';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Web3 from 'web3';
import { readRemoteFile } from 'react-papaparse';
import {
  SALE_TOKEN_ADDRESS, SALETOKENABI, MAIN_DEP_ADDRESS, MAINDEPABI
} from '../../../ethContracts';




let id = 0;
function createData(name, value) {
  id += 1;
  return {
    id,
    name,
    value
  };
}

const data = [
  createData('Total Supply', 10000),
  createData('Soft Cap', 10 + ' ETH'),
  createData('Hard Cap', 100 + ' ETH'),
  createData('Tokens For Presale', 5000),
  createData('Presale Price per Token', 0.1 + ' ETH'),
  createData('Minimum Contribution', 0.1 + ' ETH'),
  createData('Maximum Contribution', 10 + ' ETH'),
  createData('Presale Start Time', 'November 15, 2020'),
  createData('Presale End Time', 'November 16, 2020'),
  createData('Uniswap Listing Price per Token', 0.125 + ' ETH'),
  createData('Uniswap Liquidity %', 50),
  createData('Liquidity Unlock Date', 'December 1, 2021'),
  createData('Funds locked for Governance', 20),
  createData('Governance start date', 'February 10, 2021'),
  createData('Team Fund', 500),
  createData('Team funds release date', 'January 20, 2021'),
  createData('Marketing Fund', 500),
  createData('Marketing funds release date', 'December 25, 2020')
];

class Presale extends React.Component {

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
    walletNetwork: 'Testnet',
    logoUrl: '',
    webLink: '',
    gitLink: '',
    twitterLink: '',
    redditLink: '',
    tgLink: '',
    walletLabels: '',
    projectDesc: '',
    updates: '',
    saleId: '',
  };

  componentDidMount(){
    this.connectWeb3();
    this.fetchRGoogle('https://docs.google.com/spreadsheets/d/e/2PACX-1vTlBHroYzhhGYlBIrtPqM2izhnfWhIWbNjaih_ob5ruqtbWDWC6UbFZAmN1VhZUA_U80Ws8ecVwDUJ1/pub?output=csv');
    this.getSaleID();
    }

 

  async connectWeb3(showLoad){
    var newWeb3 = null;
    var linkedAccount = null;
    var balance = 0;
    var newBalance = 0;
    if (window.ethereum){
      newWeb3 = new Web3(window.ethereum);
      window.ethereum.enable();
      this.setState({ web3: newWeb3 });
      linkedAccount = await newWeb3.eth.getAccounts();
      if (linkedAccount == null || linkedAccount == ''){
        console.log("Not connected properly: ", linkedAccount);
        return 0;
      }
      if (linkedAccount[0].substr(0,2) == '0x'){
        var network = await newWeb3.eth.net.getNetworkType()
        if ( network == "main"){
          this.setState({ walletNetwork: "Mainnet" });
        }
        else{
          this.setState({ walletNetwork: 'Testnet: ' + network });
        }
        balance = await newWeb3.eth.getBalance(linkedAccount[0]);
        newBalance = (balance/1000000000000000000).toFixed(4);; 
        this.setState({ walletAddress: linkedAccount });
        this.setState({ walletConnected: true });
        this.setState({ walletBalance: newBalance });
      }
    }
    else if (window.web3) {
      var newWeb3 = null;
      var linkedAccount = null;
      var balance = 0;
      var newBalance = 0;
      newWeb3 = new Web3(window.web3.currentProvider);
      window.ethereum.enable();
      this.setState({ web3: newWeb3 });
      linkedAccount = await newWeb3.eth.getAccounts();
      if (linkedAccount == null || linkedAccount == ''){
        console.log("Not connected properly: ", linkedAccount);
        return 0;
      }
      if (linkedAccount[0].substr(0,2) == '0x'){
        var network = await newWeb3.eth.net.getNetworkType()
        if ( network == "main"){
          this.setState({ walletNetwork: "Mainnet" });
        }
        else{
          this.setState({ walletNetwork: 'Testnet: ' + network });
        }
        balance = await newWeb3.eth.getBalance(linkedAccount[0]);
        newBalance = (balance/1000000000000000000).toFixed(4);; 
        this.setState({ walletAddress: linkedAccount });
        this.setState({ walletConnected: true });
        this.setState({ walletBalance: newBalance });
      }
    }
    else {
      console.log("This is an unsupported browser!");
    }
  }

 
  

  async fetchRGoogle(url){
    var resultDatas = "";
    var logoUrlDatas = "";
    var webLinkDatas = "";
    var gitLinkDatas = "";
    var twitterLinkDatas ="";
    var redditLinkDatas = "";
    var tgLinkDatas = "";
    var walletLabelsDatas = "";
    var projectDescDatas="";
    var updatesDatas="";
    await readRemoteFile((url), {
      download: true,
      skipEmptyLines:true,
      complete: (results,file) => {
        logoUrlDatas = results['data'][0][1];
        resultDatas = results['data'][0][1];
        webLinkDatas = results['data'][1][1];
        gitLinkDatas = results['data'][2][1];
        twitterLinkDatas = results['data'][3][1];
        redditLinkDatas = results['data'][4][1];
        tgLinkDatas = results['data'][5][1];
        walletLabelsDatas = results['data'][6][1];
        projectDescDatas = results['data'][7][1];
        updatesDatas = results['data'][8][1];
       
        this.setState({logoUrl: logoUrlDatas})
        this.setState({sheetData: resultDatas})
        this.setState({webLink: webLinkDatas})
        this.setState({gitLink: gitLinkDatas})
        this.setState({twitterLink: twitterLinkDatas})
        this.setState({redditLink: redditLinkDatas})
        this.setState({tgLink: tgLinkDatas})
        this.setState({walletLabels: walletLabelsDatas})
        this.setState({projectDesc: projectDescDatas})
        this.setState({updates: updatesDatas})
        console.log(results);
        
      }
    })
  }
  
  

  async getSaleID() {
    let params = (new URL(document.location)).searchParams;
    let saleIdDatas = params.get('saleID'); 
    this.setState({saleId: saleIdDatas})
  }



  render() {
    const { classes } = this.props;
    const title = brand.name + ' - Browse Single Presale';
    const description = brand.desc;
    const { web3connect } = this.state;
    const { walletAddress } = this.state;
    const { walletConnected } = this.state;
    const { walletBalance } = this.state;
    const { walletNetwork } = this.state;
    const {logoUrl} = this.state;
    const {webLink} = this.state;
    const {gitLink} = this.state;
    const {twitterLink} = this.state;
    const {redditLink} = this.state;
    const {tgLink} = this.state;
    const {walletLabels} = this.state;
    const {projectDesc} = this.state;
    const {updates} = this.state;
    const {saleId} = this.state;
    
    return (
      <div>
        
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="twitter:title" content={title} />
          <meta property="twitter:description" content={description} />
        </Helmet>
        <Paper elevation={3} style={{paddingTop: '8px', paddingBottom: '8px', marginBottom: '20px'}}>
        {walletConnected 
          ?
            <Grid container>
              <Grid item md={3} container direction="column" alignItems="center" justify="center">
                <Typography align='center'>Network</Typography>
                <Chip style={{width:"150px"}} color='primary' label={'' + walletNetwork}></Chip>
              </Grid>
              <Grid item md={6} container direction="column" alignItems="center" justify="center">
                <Typography align='center'>Wallet</Typography>
                <Chip style={{width:"150px"}} color='primary' label={('' + walletAddress + '').substr(0,6) + '...' + ('' + walletAddress + '').substr((('' + walletAddress + '').length-4),('' + walletAddress + '').length)} ></Chip>
              </Grid>
              <Grid item md={3} container direction="column" alignItems="center" justify="center">
                <Typography align='center'>ETH Balance</Typography>
                <Chip style={{width:"150px"}} color='primary' label={walletBalance + ' ETH'}></Chip>
              </Grid>
            </Grid>
          : 
            <Grid container>
              <Grid item md={3} container direction="column" alignItems="center" justify="center">
              </Grid>
              <Grid item md={6} container direction="column" alignItems="center" justify="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.connectWeb3()}
                >
                  Connect Wallet to Start
                </Button>
              </Grid>
              <Grid item md={3} container direction="column" alignItems="center" justify="center">
              </Grid>
            </Grid>
          }
        </Paper>
        {walletConnected
        ?
          <PapperBlock whiteBg noMargin title='CORE' imgIcon={true} desc='cvault.finance' imgUrl={logoUrl}>
          
        <div>CORE is a non-inflationary cryptocurrency that is designed to execute profit-generating strategies autonomously with a completely decentralized approach. In existing autonomous strategy-executing platforms a team or single developer is solely responsible for determining how locked funds are used to generate ROI. This is hazardous to the health of the fund as it grows, as it creates flawed incentives, and invites mistakes to be made. CORE does away with this dynamic and instead opts for one with decentralized governance.</div>
            <br/><br/>
            <Grid container>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}></Grid>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                <Typography align="center">50/100 ETH Raised</Typography>
                <LinearProgress variant="determinate" className={progressStyles.bgInfo} value={50} />
              </Grid>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}></Grid>
            </Grid>
            <br/><br/>
            <Grid container>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}></Grid>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                <Typography align="center">Participate in the presale now!</Typography>
                <br/>
                <Typography align="center">1 ETH = 500 CORE</Typography>
              </Grid>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}></Grid>
            </Grid>
            <br/>
            <Grid container>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}></Grid>
              <Grid item xl={2} lg={2} md={2} sm={12} xs={12}>
                <TextField
                      placeholder='Amount ETH'
                      id="ethInput"
                      fullWidth
                      color='primary'
                      style={{margin: '2px', marginLeft: '2px', marginRight: '2px'}}
                    />
              </Grid>
              <Grid item xl={2} lg={2} md={2} sm={12} xs={12}>
                <TextField
                      placeholder='Amount Token'
                      id="tokenInput"
                      fullWidth
                      color='primary'
                      style={{margin: '2px', marginLeft: '2px', marginRight: '2px'}}
                    />
              </Grid>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}></Grid>
            </Grid>
            <Grid container alignItems='center' justify='center' direction='column'>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}></Grid>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
              <Button
                //onClick={this.handleBack}
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Contribute
              </Button>
              </Grid>
              <Grid item xl={4} lg={4} md={4} sm={12} xs={12}></Grid>
            </Grid>
            <div>
              <table>
                <tbody>
                {data.map(n => ([
                  <tr key={n.id}>
                    <td>{n.name}</td>
                    <td align="right">{n.value}</td>
                  </tr>
                ]))}
                </tbody>
              </table>
            </div>
          </PapperBlock>
        : 
          <Paper style={{paddingTop: '5px', paddingBottom: '5px'}}>
            <Grid container>
              <Grid item md={3} container direction="column" alignItems="center" justify="center">
              </Grid>
              <Grid item md={6} container direction="column" alignItems="center" justify="center">
                <Typography>Please connect your wallet to view the presale!</Typography>
              </Grid>
              <Grid item md={3} container direction="column" alignItems="center" justify="center">
              </Grid>
            </Grid>
          </Paper>
        }
      </div>
    );
  }
}

Presale.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Presale);
