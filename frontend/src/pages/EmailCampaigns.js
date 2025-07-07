import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Send, 
  Trash2,
  Users,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    targetAudience: 'all'
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/email/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/email/campaigns', newCampaign);
      toast.success('Campanha criada com sucesso');
      setShowCreateModal(false);
      setNewCampaign({ name: '', subject: '', content: '', targetAudience: 'all' });
      fetchCampaigns();
    } catch (error) {
      toast.error('Erro ao criar campanha');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (window.confirm('Tem certeza que deseja enviar esta campanha?')) {
      try {
        await axios.post(`/api/email/campaigns/${campaignId}/send`);
        toast.success('Campanha enviada com sucesso');
        fetchCampaigns();
      } catch (error) {
        toast.error('Erro ao enviar campanha');
      }
    }
  };

  const handleDelete = async (campaignId) => {
    if (window.confirm('Tem certeza que deseja deletar esta campanha?')) {
      try {
        await axios.delete(`/api/email/campaigns/${campaignId}`);
        toast.success('Campanha deletada com sucesso');
        fetchCampaigns();
      } catch (error) {
        toast.error('Erro ao deletar campanha');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'sent': return 'Enviada';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
        <p className="text-gray-600">Gerencie suas campanhas de email</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunhos</option>
              <option value="sent">Enviadas</option>
            </select>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Campanha
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                  {getStatusLabel(campaign.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                {campaign.targetAudience === 'all' ? 'Todos os leads' : 'Leads novos'}
              </div>
              {campaign.sentCount && (
                <div className="flex items-center text-sm text-gray-500">
                  <Send className="h-4 w-4 mr-2" />
                  {campaign.sentCount} enviados
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(campaign.createdAt)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {campaign.status === 'draft' && (
                <button
                  onClick={() => handleSendCampaign(campaign._id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Enviar
                </button>
              )}
              <button
                onClick={() => handleDelete(campaign._id)}
                className="px-3 py-2 text-red-600 hover:text-red-900 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Campanha</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Boas-vindas aos novos leads"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <input
                  type="text"
                  required
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Bem-vindo à DevStudio!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Público-alvo</label>
                <select
                  value={newCampaign.targetAudience}
                  onChange={(e) => setNewCampaign({...newCampaign, targetAudience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os leads</option>
                  <option value="new">Leads novos (últimos 7 dias)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  required
                  rows={8}
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o conteúdo do email... Use {{nome}} para personalizar."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{{nome}}'} para personalizar o email com o nome do lead
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaigns; 