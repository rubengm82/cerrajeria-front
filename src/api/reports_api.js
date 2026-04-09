import api from './axiosConfig'

export const getReportsSummary = () => api.get('/reports/summary')
