import React, { useState } from "react";
import { TextField, Button } from "@mui/material";

const CustomXAxis = ({ onApply }) => {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  return (
    <div>
      <TextField
        label="Start Value"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        margin="normal"
      />
      <TextField
        label="End Value"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        margin="normal"
      />
      <Button onClick={() => onApply(min, max)}>Apply X-Axis Range</Button>
    </div>
  );
};

export default CustomXAxis;