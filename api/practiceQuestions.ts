import axios from "axios";

const API_URL = "https://s2tvrgs9-4300.euw.devtunnels.ms/api/v1"; // Replace with your actual API URL

export const practiceQuestionsApi = {
  // Questions
  getQuestions: (topicId?: string) =>
    axios.get(`${API_URL}/practice-questions/questions`, {
      params: { topicId },
    }),
  getQuestion: (id: string) =>
    axios.get(`${API_URL}/practice-questions/question/${id}`),
  createQuestion: (data: { content: string; topicId: string }) =>
    axios.post(`${API_URL}/practice-questions/question`, data),
  updateQuestion: (id: string, data: { content?: string; topicId?: string }) =>
    axios.put(`${API_URL}/practice-questions/question/${id}`, data),
  deleteQuestion: (id: string) =>
    axios.delete(`${API_URL}/practice-questions/question/${id}`),

  // Topics
  getTopics: (categoryId?: string) =>
    axios.get(`${API_URL}/practice-questions/topics`, {
      params: { categoryId },
    }),
  getTopic: (id: string) =>
    axios.get(`${API_URL}/practice-questions/topic/${id}`),
  createTopic: (data: { title: string; categoryId: string }) =>
    axios.post(`${API_URL}/practice-questions/topic`, data),
  updateTopic: (id: string, data: { title?: string; categoryId?: string }) =>
    axios.put(`${API_URL}/practice-questions/topic/${id}`, data),
  deleteTopic: (id: string) =>
    axios.delete(`${API_URL}/practice-questions/topic/${id}`),

  // Categories
  getCategories: () => axios.get(`${API_URL}/practice-questions/categories`),
  getCategory: (id: string) =>
    axios.get(`${API_URL}/practice-questions/category/${id}`),
  createCategory: (data: { name: string; description?: string }) =>
    axios.post(`${API_URL}/practice-questions/category`, data),
  updateCategory: (id: string, data: { name?: string; description?: string }) =>
    axios.put(`${API_URL}/practice-questions/category/${id}`, data),
  deleteCategory: (id: string) =>
    axios.delete(`${API_URL}/practice-questions/category/${id}`),
};
