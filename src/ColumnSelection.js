import React, { useState } from "react";
import { Checkbox, FormControlLabel, TextField, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const ColumnSelection = ({ columns, selectedColumns = [], onColumnSelect, onIndexColumnSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColumns = columns.filter((col) =>
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <TextField
        label="Search Columns"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Select X-Axis Column</InputLabel>
        <Select
          value={columns.includes(selectedColumns) ? selectedColumns : ""}
          onChange={(e) => onIndexColumnSelect(e.target.value)}
        >
          {columns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filteredColumns.map((col) => (
        <FormControlLabel
          key={col}
          control={
            <Checkbox
              checked={selectedColumns.includes(col)}
              onChange={(e) => onColumnSelect(col, e.target.checked)}
            />
          }
          label={col}
        />
      ))}
    </div>
  );
};

export default ColumnSelection;
