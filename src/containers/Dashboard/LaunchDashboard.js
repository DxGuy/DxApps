import React, { useState } from 'react';
import PropTypes from 'prop-types';
import brand from '../../api/dummy/brand';
import { Helmet } from 'react-helmet';
import { withStyles } from '@material-ui/core/styles';
import PapperBlock from '../../components/PapperBlock/PapperBlock';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Toast from 'light-toast';
import Input from '@material-ui/core/Input';
import {InsetDivider} from '../../components/Divider';
import TableWidget from '../../components/Widget/TableWidget';
import FilesWidget from '../../components/Widget/FilesWidget';
import styles from './dashboard-jss';

import Web3 from 'web3';

//Connect to web3



// Temporarily hardcode the data
const data = [
  createData('CORE', 'cVault.Finance', 'https://cvault.finance', '13 Sep 2020', '20 Sep 2020', 300, 300, 0.1, 100, 'https://assets.coingecko.com/coins/images/12635/large/cvault.finance_logo.png?1601353499', '', 300, 300, 'Success', 'Completed'),
  createData('SALE', 'DxSale', 'https://dxsale.network', '19 Aug 2025', '26 Aug 2025', 0, 1000, 0.1, 10, 'https://dxsale.network/assets/media/DxSALE.svg', '', 0, 1000, 'Warning', 'Pending'),
  createData('PRIA', 'Pria', 'https://pria.eth.link/', '5 Oct 2020', '10 Oct 2020', 579, 1000, 1, 20, 'https://assets.coingecko.com/coins/images/12905/small/pria-200x.png?1603357286', '', 579, 1000, 'Info', 'In Governance'),
  createData('LINK', 'Chainlink', 'https://omg.network/', '18 Oct 2017', '20 Nov 2017', 4783, 5000, 1, 100, 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png?1547034700', '', 4783, 5000, 'Success', 'Completed'),
  createData('CDAI', 'Compound Dai', '', '18 Oct 2017', '20 Nov 2017', 2000, 5000, 1, 100, 'https://assets.coingecko.com/coins/images/9281/small/cDAI.png?1576467585', '', 2000, 5000, 'Warning', 'Pending'),
  createData('OMG', 'OMG Network', 'https://omg.network/', '10 Dec 2020', '22 Dec 2020', 0, 50, 0.5, 1, 'https://omg.network/wp-content/uploads/2020/05/omg-token-1.png', '', 0, 50, 'Default', 'Failed'),
];

// Acquire data from blockchain and populate into cards
function createData(id, name, website, startDate, endDate, softCap, hardCap, minCont, maxCont, photo, type, currentStock, totalStock, status, statusMessage) {
  return {
    id,
    name,
    website,
    startDate,
    endDate,
    softCap,
    hardCap,
    minCont,
    maxCont,
    photo,
    type,
    currentStock,
    totalStock,
    status,
    statusMessage,
  };
}


class LaunchDashboard extends React.Component {
  state =
  {
    switchCardstoList: false,
    walletConnected: false,
    web3: null,
    walletAddress: null,
    walletBalance: 0,
    walletNetwork: 'none',
  };

  componentDidMount(){
    this.connectWeb3();
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

  flipCardsToList() {
    const { switchCardstoList } = this.state;
    var myBool = switchCardstoList;
    if (myBool)
      this.setState({ switchCardstoList: false });
    else
      this.setState({ switchCardstoList: true });
  }
  

  render() {
    const title = brand.name + ' - LaunchPad';
    const description = brand.desc;

    const { switchCardstoList } = this.state;
    const { walletConnected } = this.state;
    const { classes, history } = this.props;
    const { walletAddress } = this.state;
    const { walletBalance } = this.state;
    const { walletNetwork } = this.state;

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
        <Paper elevation={3} style={{paddingTop: '8px', paddingBottom: '8px'}}>
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
        <Divider className={classes.divider} />
        <PapperBlock whiteBg title="The first decentralized launchpad with governance" desc="" imgIcon={true} imgUrl={'https://dxsale.network/assets/media/dxLaunch.svg'}>
          <InsetDivider />
          <Grid container>
            
            <Grid item md={2} container direction="column" alignItems="center" justify="center">
              <Button size="small" color="primary" onClick={e => {
                      history.push('/app/pages/createsale');
                    }}>
                Start or Manage Sale
              </Button>
            </Grid>
            <Grid item md={8} container alignItems="center" justify="center">
              {!walletConnected 
              ?
                <div><br/>Awaiting Wallet Connection ...<br/><br/></div>
              : 
                <Input
                  placeholder="Search coming soon!"
                  className={classes.input}
                  inputProps={{
                    'aria-label': 'Description',
                  }}
                  fullWidth
                  color='primary'
                  disabled={true}
                >
                </Input>
              }
            </Grid>
            <Grid item md={2} container direction="row" alignItems="center" justify="center">
              <IconButton className={classes.button} color='primary'>
                <i className="ion-ios-information-outline" />
              </IconButton>
              <IconButton disabled={true} className={classes.button} color='primary'>
                <i className="ion-levels" />
              </IconButton>
              <IconButton disabled={true} className={classes.button} onClick={() => this.flipCardsToList()} color='primary'>
                { !switchCardstoList ? <i className="ion-navicon" /> : <i className="ion-grid" />}
              </IconButton>
            </Grid>
          </Grid>
        </PapperBlock>
        { !switchCardstoList
        ?
        <div> 
          {walletConnected 
          ? 
            <div>
              <Divider className={classes.divider} />
              <FilesWidget web3 = {web3}/>
            </div>

          : null
          }

        </div>
        :
        <div>
          <Divider className={classes.divider} />
          <TableWidget />
        </div>
        }

      </div>
    );
  }
}

LaunchDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LaunchDashboard);
