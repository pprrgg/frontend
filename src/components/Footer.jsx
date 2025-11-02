import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const fuchsiaColor = "#D100D1";

const FooterResponsive = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  return (
    <div>
      {/* Footer estilo app móvil */}
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        sx={{
          width: '100%',
          position: 'fixed',
          bottom: 0,
          bgcolor: 'white',
          borderTop: '1px solid #ddd',
          zIndex: 300,
        }}
        showLabels
      >
        <BottomNavigationAction
          label="Blog"
          icon={<SearchIcon />}
          onClick={() => navigate('/Blog')}
          sx={{
            color: value === 0 ? fuchsiaColor : "gray",
            '&.Mui-selected': { color: fuchsiaColor },
          }}
        />
      </BottomNavigation>
    </div>
  );
};

export default FooterResponsive;
