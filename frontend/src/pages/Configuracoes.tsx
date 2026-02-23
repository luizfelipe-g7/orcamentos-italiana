import React, { useEffect, useRef, useState } from 'react';
import { Header } from '../components/layout/Header';
import { User, Shield, Lock, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { User as AppUser } from '../types/user';
import { resolvePhotoUrl } from '../utils/photoUrl';

export function Configuracoes() {
  const { user, logout, setUserData } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADM';

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoEditModalOpen, setPhotoEditModalOpen] = useState(false);
  const [photoPreviewSrc, setPhotoPreviewSrc] = useState<string>('');
  const [photoZoom, setPhotoZoom] = useState(1.2);
  const [photoOffset, setPhotoOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const photoPreview = resolvePhotoUrl(user?.foto_url);

  const [vendedores, setVendedores] = useState<AppUser[]>([]);
  const [loadingVendedores, setLoadingVendedores] = useState(false);
  const hasLoadedVendedoresRef = useRef(false);
  const [novoVendedor, setNovoVendedor] = useState({
    nome: '',
    email: '',
    senha: '',
  });

  useEffect(() => {
    if (!user) return;
    setNome(user.nome || '');
    setEmail(user.email || '');
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    if (hasLoadedVendedoresRef.current) return;
    hasLoadedVendedoresRef.current = true;
    loadVendedores();
  }, [isAdmin]);

  const loadVendedores = async () => {
    try {
      setLoadingVendedores(true);
      const response = await api.get<{ success: boolean; data: AppUser[] }>('/auth/vendedores');
      setVendedores(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      const status = (error as any)?.response?.status;
      if (status === 429) {
        alert('Muitas requisições em sequência. Aguarde alguns segundos e tente novamente.');
      }
    } finally {
      setLoadingVendedores(false);
    }
  };

  const salvarPerfil = async () => {
    try {
      setSavingProfile(true);
      if (!user) return;

      if (isAdmin) {
        const payload: Record<string, string> = {
          nome,
          email,
        };
        if (senha.trim()) payload.senha = senha.trim();

        const response = await api.put<{ success: boolean; data: AppUser }>('/auth/me', payload);
        if (response.data?.data) {
          setUserData(response.data.data);
        }
      }

      setSenha('');
      alert('Perfil atualizado com sucesso.');
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      alert(error?.response?.data?.error || 'Erro ao salvar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadPhotoFile = async (file: File) => {
    try {
      setUploadingPhoto(true);
      const form = new FormData();
      form.append('foto', file);

      const response = await api.post<{ success: boolean; data: AppUser }>(
        '/auth/me/photo/upload',
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data?.data) {
        setUserData(response.data.data);
      }

      alert('Foto de perfil atualizada.');
    } catch (error: any) {
      console.error('Erro ao enviar foto:', error);
      alert(error?.response?.data?.error || 'Erro ao enviar foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido.');
      return;
    }
    setSelectedPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreviewSrc(localUrl);
    setPhotoZoom(1.2);
    setPhotoOffset({ x: 0, y: 0 });
    setPhotoEditModalOpen(true);
  };

  const closePhotoModal = () => {
    setPhotoEditModalOpen(false);
    setSelectedPhotoFile(null);
    if (photoPreviewSrc) {
      URL.revokeObjectURL(photoPreviewSrc);
    }
    setPhotoPreviewSrc('');
    setPhotoZoom(1.2);
    setPhotoOffset({ x: 0, y: 0 });
    setIsDraggingPhoto(false);
  };

  const handleConfirmPhoto = async () => {
    if (!selectedPhotoFile || !photoPreviewSrc) return;

    const image = new Image();
    image.src = photoPreviewSrc;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Erro ao processar imagem.'));
    });

    const canvas = document.createElement('canvas');
    const outSize = 800;
    canvas.width = outSize;
    canvas.height = outSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('Não foi possível processar a imagem.');
      return;
    }

    // Recorte quadrado com zoom + deslocamento manual (arraste)
    const viewportSize = 288; // equivalente ao w-72/h-72 no modal
    const baseScale = Math.max(viewportSize / image.naturalWidth, viewportSize / image.naturalHeight);
    const effectiveScale = baseScale * Math.max(photoZoom, 1);
    const sourcePerPixel = 1 / effectiveScale;

    const cropSize = viewportSize * sourcePerPixel;
    let centerX = image.naturalWidth / 2 - photoOffset.x * sourcePerPixel;
    let centerY = image.naturalHeight / 2 - photoOffset.y * sourcePerPixel;

    // Clamp para garantir recorte válido
    centerX = Math.max(cropSize / 2, Math.min(image.naturalWidth - cropSize / 2, centerX));
    centerY = Math.max(cropSize / 2, Math.min(image.naturalHeight - cropSize / 2, centerY));

    const sx = centerX - cropSize / 2;
    const sy = centerY - cropSize / 2;
    ctx.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, outSize, outSize);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((value) => resolve(value), 'image/jpeg', 0.92);
    });
    if (!blob) {
      alert('Falha ao gerar imagem final.');
      return;
    }

    const file = new File([blob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });
    await uploadPhotoFile(file);
    closePhotoModal();
  };

  const startDragPhoto = (clientX: number, clientY: number) => {
    setIsDraggingPhoto(true);
    setDragStart({ x: clientX, y: clientY });
    setDragStartOffset({ ...photoOffset });
  };

  const handlePhotoMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    startDragPhoto(event.clientX, event.clientY);
  };

  const handlePhotoTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    startDragPhoto(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!isDraggingPhoto) return;

    const onMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      setPhotoOffset({
        x: dragStartOffset.x + deltaX,
        y: dragStartOffset.y + deltaY,
      });
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      setPhotoOffset({
        x: dragStartOffset.x + deltaX,
        y: dragStartOffset.y + deltaY,
      });
    };

    const stopDragging = () => setIsDraggingPhoto(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', stopDragging);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDraggingPhoto, dragStart.x, dragStart.y, dragStartOffset.x, dragStartOffset.y]);

  const criarVendedor = async () => {
    try {
      await api.post('/auth/vendedores', novoVendedor);
      setNovoVendedor({ nome: '', email: '', senha: '' });
      await loadVendedores();
      alert('Vendedor criado com sucesso.');
    } catch (error: any) {
      console.error('Erro ao criar vendedor:', error);
      alert(error?.response?.data?.error || 'Erro ao criar vendedor.');
    }
  };

  const atualizarVendedor = async (vendedor: AppUser, update: Partial<AppUser> & { senha?: string }) => {
    try {
      await api.put(`/auth/vendedores/${vendedor.id}`, update);
      await loadVendedores();
      alert('Vendedor atualizado.');
    } catch (error: any) {
      console.error('Erro ao atualizar vendedor:', error);
      alert(error?.response?.data?.error || 'Erro ao atualizar vendedor.');
    }
  };

  return (
    <>
      <Header title="Configurações" subtitle="Gerencie suas preferências e conta" />
      
      <main className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Perfil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <User size={20} className="text-[#003366]" />
                Perfil do Usuário
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil</label>
                  <div className="mb-3">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Prévia da foto"
                        className="w-20 h-20 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-gray-600">Arquivo da máquina:</span>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileSelection}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="px-3 py-1.5 rounded border border-[#003366] text-[#003366] text-xs font-medium hover:bg-[#003366] hover:text-white transition-colors disabled:opacity-60"
                    >
                      Selecionar Foto
                    </button>
                    <span className="text-xs text-gray-500 truncate max-w-[220px]">
                      {selectedPhotoFile ? selectedPhotoFile.name : 'Nenhum arquivo selecionado'}
                    </span>
                    {uploadingPhoto && <span className="text-xs text-gray-500">Enviando...</span>}
                  </div>
                </div>
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-700"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                  <input 
                    type="text" 
                    value={user?.role === 'ADM' ? 'Administrador' : 'Operador'} 
                    disabled 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                  />
                </div>
              </div>
              {!isAdmin && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
                  Como vendedor, você pode alterar somente a foto de perfil. Alterações de nome/email devem ser feitas por um administrador.
                </p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={salvarPerfil}
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#004080] disabled:opacity-70"
                >
                  {savingProfile ? 'Salvando...' : 'Salvar Perfil'}
                </button>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Shield size={20} className="text-[#003366]" />
                Segurança
              </h2>
            </div>
            <div className="p-6">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-2 text-[#003366] font-medium hover:underline"
              >
                <Lock size={16} />
                Sair da conta
              </button>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Plus size={20} className="text-[#003366]" />
                  Gestão de Vendedores
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="Nome do vendedor"
                    value={novoVendedor.nome}
                    onChange={(e) => setNovoVendedor((prev) => ({ ...prev, nome: e.target.value }))}
                  />
                  <input
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="Email"
                    value={novoVendedor.email}
                    onChange={(e) => setNovoVendedor((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <input
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="Senha inicial"
                    type="password"
                    value={novoVendedor.senha}
                    onChange={(e) => setNovoVendedor((prev) => ({ ...prev, senha: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end">
                  <button onClick={criarVendedor} className="px-4 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#004080]">
                    Registrar Vendedor
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Vendedores cadastrados</h3>
                  {loadingVendedores ? (
                    <p className="text-sm text-gray-500">Carregando...</p>
                  ) : vendedores.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum vendedor cadastrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {vendedores.map((v) => (
                        <VendedorItem key={v.id} vendedor={v} onSave={atualizarVendedor} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {photoEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Ajustar Foto de Perfil</h3>
            <p className="text-sm text-gray-500 mb-4">Ajuste o zoom, arraste a imagem para posicionar e confirme.</p>

            <div className="flex justify-center mb-4">
              <div
                className={`w-72 h-72 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 relative ${isDraggingPhoto ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoTouchStart}
              >
                {photoPreviewSrc && (
                  <img
                    src={photoPreviewSrc}
                    alt="Prévia para edição"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      transform: `translate(${photoOffset.x}px, ${photoOffset.y}px) scale(${photoZoom})`,
                      transformOrigin: 'center center',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                    draggable={false}
                  />
                )}
              </div>
            </div>

            <div className="px-4">
              <label className="block text-xs text-gray-600 mb-2">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={photoZoom}
                onChange={(e) => setPhotoZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closePhotoModal}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                disabled={uploadingPhoto}
                className="px-4 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#004080] disabled:opacity-60"
              >
                {uploadingPhoto ? 'Salvando...' : 'Confirmar e Subir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function VendedorItem({
  vendedor,
  onSave,
}: {
  vendedor: AppUser;
  onSave: (vendedor: AppUser, update: Partial<AppUser> & { senha?: string }) => Promise<void>;
}) {
  const [nome, setNome] = useState(vendedor.nome);
  const [email, setEmail] = useState(vendedor.email);
  const [ativo, setAtivo] = useState(vendedor.ativo ?? true);
  const [senha, setSenha] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(vendedor, {
      nome,
      email,
      ativo,
      senha: senha.trim() || undefined,
    });
    setSenha('');
    setSaving(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
      <input className="p-2 border border-gray-300 rounded" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input className="p-2 border border-gray-300 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="p-2 border border-gray-300 rounded" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Nova senha (opcional)" />
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Ativo
        </label>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 rounded bg-[#003366] text-white text-sm hover:bg-[#004080] disabled:opacity-60"
        >
          {saving ? '...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
