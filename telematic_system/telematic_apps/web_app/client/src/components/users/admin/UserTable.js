import InfoIcon from '@mui/icons-material/Info';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from '@mui/material';
import React from 'react';
import UserTableRow from './UserTableRow';

const UserTable = (props) => {
    const columns = [
        { id: 'login', label: 'User Name', minWidth: 170, align: 'center', info: '' },
        { id: 'email', label: 'Email', minWidth: 100, align: 'center', info: '' },
        { id: 'is_admin', label: 'Is Server Admin', minWidth: 170, align: 'center', format: (value) => value.toLocaleString('en-US'), info: '' },
        { id: 'last_seen_at', label: 'Last Login', minWidth: 170, align: 'center', format: (value) => value.toLocaleString('en-US'), info: '' },
        { id: 'org_role', label: 'Organization Roles', minWidth: 170, align: 'center', info: 'Green color highlights the user\'s current active organization' }
    ];
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <React.Fragment>
            <TableContainer sx={{ minHeight: 0, overflowY: 'scroll', overflowX: 'hidden', maxHeight: "600px" }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead >
                        <TableRow >
                            {columns.map((column) => {
                                if (column.label.length > 0 && column.id === "org_role") {
                                    return <Tooltip key={`user-table-tooltip`} title={column.info} placement="top">
                                        <TableCell
                                            key={column.id + column.label}
                                            align={column.align}
                                            style={{ top: 0, minWidth: column.minWidth, fontWeight: "bolder", backgroundColor: "#eee" }}>
                                            {column.label} <InfoIcon />
                                        </TableCell>
                                    </Tooltip>
                                } else {
                                    return (
                                        <TableCell
                                            key={column.id + column.label}
                                            align={column.align}
                                            style={{ top: 0, minWidth: column.minWidth, fontWeight: "bolder", backgroundColor: "#eee" }}>
                                            {column.label}
                                        </TableCell>
                                    )
                                }
                            })}
                            <TableCell key={`user-table-control`} tabIndex={-1} style={{ top: 0, fontWeight: "bolder", backgroundColor: "#eee" }}>
                                Controls
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.users !== undefined &&
                            props.users
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(
                                    (userRow) => {
                                        return (
                                            <UserTableRow key={`user-table-row-${userRow.id}`}
                                                userRow={userRow}
                                                onAddUserToOrg={props.onAddUserToOrg}
                                                onUserOrgRoleChange={props.onUserOrgRoleChange}
                                                onUserOrgRoleDelete={props.onUserOrgRoleDelete}
                                                columns={columns} orgs={props.orgs}
                                                orgsUsers={props.orgsUsers}
                                                onChangeServerAdmin={props.onChangeServerAdmin} />
                                        );
                                    })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={props.users !== undefined ? props.users.length : 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </React.Fragment>
    )
}

export default UserTable