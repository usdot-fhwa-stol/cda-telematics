import React from 'react'
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const CopyRight = React.memo((props) => {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="#">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
});


export default CopyRight