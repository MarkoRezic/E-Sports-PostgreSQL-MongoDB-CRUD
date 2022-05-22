const userInfoModel = (sqlResult) => {
    return {
        user_id: sqlResult[0].user_id,
        firstname: sqlResult[0].firstname,
        lastname: sqlResult[0].lastname,
        email: sqlResult[0].email,
        google_id: sqlResult[0].google_id,
        facebook_id: sqlResult[0].facebook_id,
        role: sqlResult[0].role_name,
        has_vestos_login: sqlResult[0].has_vestos_login,
        email_verified: sqlResult[0].email_verified,
    };
}

module.exports = {
    userInfoModel
}