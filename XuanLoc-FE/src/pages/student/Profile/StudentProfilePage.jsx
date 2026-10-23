import { useEffect, useRef, useState } from 'react';
import { Card, Form, Input, DatePicker, Button, Row, Col, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { getInitials } from '@/common/utils/getInitials.js';
import { updateAuthUser } from '@/redux/slices/authSlice.jsx';
import { fetchStudentProfile, updateStudentProfile, changeMyPassword, uploadMyAvatar } from '@/redux/slices/profileSlice.jsx';

const StudentProfilePage = () => {
  const dispatch = useDispatch();
  const { data: profile, status } = useSelector((state) => state.profile);
  const loading = status === 'loading';
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        full_name: profile.full_name,
        phone: profile.phone,
        dob: profile.student_details?.dob ? dayjs(profile.student_details.dob) : null,
        parent_name: profile.student_details?.parent_name,
        parent_phone: profile.student_details?.parent_phone,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSaving(true);
    const resultAction = await dispatch(
      updateStudentProfile({
        ...values,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
      }),
    );
    setSaving(false);
    if (updateStudentProfile.fulfilled.match(resultAction)) {
      toast.success('Cập nhật hồ sơ thành công.');
      dispatch(updateAuthUser({ full_name: values.full_name }));
    } else {
      toast.error(resultAction.payload || 'Không thể cập nhật hồ sơ.');
    }
  };

  const handleChangePassword = async () => {
    let values;
    try {
      values = await passwordForm.validateFields();
    } catch {
      return;
    }
    setChangingPassword(true);
    const resultAction = await dispatch(
      changeMyPassword({ oldPassword: values.oldPassword, newPassword: values.newPassword }),
    );
    setChangingPassword(false);
    if (changeMyPassword.fulfilled.match(resultAction)) {
      toast.success('Đổi mật khẩu thành công.');
      passwordForm.resetFields();
    } else {
      toast.error(resultAction.payload || 'Không thể đổi mật khẩu.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingAvatar(true);
    const resultAction = await dispatch(uploadMyAvatar(file));
    setUploadingAvatar(false);
    if (uploadMyAvatar.fulfilled.match(resultAction)) {
      toast.success('Cập nhật ảnh đại diện thành công.');
      dispatch(updateAuthUser({ avatar_url: resultAction.payload.avatar_url }));
    } else {
      toast.error(resultAction.payload || 'Không thể cập nhật ảnh đại diện.');
    }
  };

  if (loading && !profile) {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Hồ Sơ Cá Nhân</h3>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="shadow-sm text-center">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold position-relative mb-3"
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#1677ff',
                fontSize: 32,
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getInitials(profile?.full_name, '?')
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            <div>
              <Button size="small" loading={uploadingAvatar} onClick={() => fileInputRef.current?.click()}>
                Đổi ảnh đại diện
              </Button>
            </div>
            <h5 className="fw-bold mt-3 mb-0">{profile?.full_name}</h5>
            <p className="text-muted small mb-1">{profile?.email}</p>
            <p className="text-muted small mb-0">Mã học viên: {profile?.student_details?.student_code}</p>
          </Card>

          <Card className="shadow-sm mt-3" title="Đổi mật khẩu">
            <Form form={passwordForm} layout="vertical">
              <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}>
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Button type="primary" loading={changingPassword} onClick={handleChangePassword}>
                Đổi mật khẩu
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card className="shadow-sm" title="Thông tin cá nhân">
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="full_name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Số điện thoại">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="dob" label="Ngày sinh">
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} />
                <Col xs={24} md={12}>
                  <Form.Item name="parent_name" label="Họ tên phụ huynh">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="parent_phone" label="SĐT phụ huynh">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" loading={saving} onClick={handleSave}>
                Lưu thay đổi
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentProfilePage;
