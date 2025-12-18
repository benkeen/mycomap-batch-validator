import React, { useEffect } from 'react';
import { UserFields } from '../fields/UserFields';
import { getObservations } from '../utils/requests';
import { DataTable } from '../dataTable/DataTable';
import { findInvalidVoucherEntries } from '../utils/data';
import type { InvalidData } from '../utils/data';
import { InvalidEntries } from '../dataTable/InvalidEntries';
import { CircularProgress } from '@mui/material';
import qs from 'query-string';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';

export const App = () => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [voucherNumFormatCheck, setVoucherNumFormatCheck] =
    React.useState<boolean>(true);
  const [invalidData, setInvalidData] = React.useState<InvalidData>({
    emptyVoucherEntries: [],
    invalidVouchers: [],
    obsWithDuplicateVoucherNums: [],
    hasErrors: false,
  });
  const [hasMadeSearch, setHasMadeSearch] = React.useState<boolean>(false);
  const [searchData, setSearchData] = React.useState({
    username: '',
    fromDate: null,
    toDate: null,
  });

  useEffect(() => {
    if (!searchData.username) {
      return;
    }

    (async () => {
      setLoading(true);
      const { username, fromDate, toDate } = searchData;
      const observationData = await getObservations(
        username,
        fromDate!,
        toDate!
      );
      setInvalidData(
        findInvalidVoucherEntries(observationData, voucherNumFormatCheck)
      );
      setData(observationData);
      setLoading(false);
      setHasMadeSearch(true);
    })();
  }, [searchData]);

  // the `?voucherNumFormatCheck=false` can be used for people with custom voucher number formats to skip the format check.
  // it'll still catch duplicates, though.
  useEffect(() => {
    const parsed = qs.parse(location.search);
    const checkFormat = parsed.voucherCheck !== 'false';
    setVoucherNumFormatCheck(checkFormat);
  }, []);

  const handleRequestData = ({ username, fromDate, toDate }: any) => {
    setSearchData({ username, fromDate, toDate });
  };

  const getInvalidDataTable = () => {
    if (
      invalidData.invalidVouchers.length === 0 &&
      invalidData.obsWithDuplicateVoucherNums.length === 0
    ) {
      return null;
    }
    return (
      <InvalidEntries
        emptyVoucherEntries={invalidData.emptyVoucherEntries}
        invalidVouchers={invalidData.invalidVouchers}
        obsWithDuplicateVoucherNums={invalidData.obsWithDuplicateVoucherNums}
      />
    );
  };

  const getPageContent = () => {
    if (loading) {
      return (
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#0066cc',
            marginTop: 30,
          }}
        >
          <CircularProgress size={28} /> <span>Loading data...</span>
        </p>
      );
    }

    if (!hasMadeSearch) {
      return null;
    }

    if (data.length === 0) {
      return <p>No observations found.</p>;
    }

    return (
      <div style={{ marginTop: 30 }}>
        {getInvalidDataTable()}
        <DataTable data={data} hasErrors={invalidData.hasErrors} />
      </div>
    );
  };

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            <a
              href='https://mycota.com/the-mycomap-bc-network/'
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              MycoMap BC
            </a>
          </Typography>

          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
            href='https://github.com/mycomapbc/batch-csv'
          >
            <GitHubIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <div style={{ margin: '0 auto', maxWidth: '1000px' }}>
        <h1>CSV Generation and Data Check</h1>
        <p>
          This script generates a downloadable CSV file of your{' '}
          <a
            href='https://www.inaturalist.org/projects/mycomap-bc-a-dna-sequencing-project'
            target='_blank'
            rel='noreferrer'
          >
            MycoMap BC
          </a>{' '}
          observations. This will locate all your fungi and slime mould
          observations{' '}
          <i>
            already added to the{' '}
            <a
              href='https://www.inaturalist.org/observations?project_id=250590'
              target='_blank'
              rel='noreferrer'
            >
              MycoMap BC project
            </a>
          </i>{' '}
          on iNaturalist.
        </p>
        <p>
          Please choose dates that will capture all the collections being sent
          in an individual shipment.
        </p>
        <p>
          After you generate and download your CSV file, please upload it when
          filling out the{' '}
          <a
            href='https://docs.google.com/forms/d/e/1FAIpQLSchGgJWGMvG56rE5xaub8UX6fiYS4rIOkh86YLZuZ4nRGK3Vg/viewform?usp=dialog'
            target='_blank'
            rel='noreferrer'
          >
            google form for project submissions
          </a>
          . You will see an option to upload at the bottom of the form.
        </p>
        <p>
          Completing this process allows you to check the accuracy of the
          voucher numbers on your observations and saves the MycoMap BC team the
          time spent entering your numbers by hand. Thank you!
        </p>
        <p>
          Please repeat both the google form and CSV generation process for each
          separate shipment you send.
        </p>
        <p></p>
        Additional notes:
        <ul>
          <li>
            If your shipment involves collections from multiple collectors, each
            collector should generate a separate CSV, and separately fill out
            the google form linked above.
          </li>
          <li>
            The same applies for specimens dropped off or handed off in person,
            please generate a CSV and complete the google form.
          </li>
          <li>
            Please contact Elora at{' '}
            <a href='mailto:eloraadamson@uvic.ca'>eloraadamson@uvic.ca</a> if
            you have any questions or issues with the process. Thank you!
          </li>
        </ul>
        <UserFields onSubmit={handleRequestData} disabled={loading} />
        {getPageContent()}
      </div>
    </>
  );
};
