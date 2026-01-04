import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";

export default function AdminSettings() {
  const configsQuery = trpc.admin.getAllConfigs.useQuery();
  const updateConfigMutation = trpc.admin.updateConfig.useMutation();
  const deleteConfigMutation = trpc.admin.deleteConfig.useMutation();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [newConfig, setNewConfig] = useState({ key: "", value: "", description: "" });
  const [showNewForm, setShowNewForm] = useState(false);

  const handleEditStart = (key: string, value: any, description?: string) => {
    setEditingKey(key);
    setEditValue(typeof value === "string" ? value : JSON.stringify(value));
    setEditDescription(description || "");
  };

  const handleEditSave = async () => {
    if (!editingKey) return;

    try {
      let parsedValue: any = editValue;
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        parsedValue = editValue;
      }

      await updateConfigMutation.mutateAsync({
        key: editingKey,
        value: parsedValue,
        description: editDescription,
      });

      toast.success("配置已更新");
      setEditingKey(null);
      configsQuery.refetch();
    } catch (error) {
      toast.error("更新失败");
      console.error(error);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`确定要删除配置 "${key}" 吗？`)) return;

    try {
      await deleteConfigMutation.mutateAsync({ key });
      toast.success("配置已删除");
      configsQuery.refetch();
    } catch (error) {
      toast.error("删除失败");
      console.error(error);
    }
  };

  const handleAddNew = async () => {
    if (!newConfig.key || !newConfig.value) {
      toast.error("请填写完整信息");
      return;
    }

    try {
      let parsedValue: any = newConfig.value;
      try {
        parsedValue = JSON.parse(newConfig.value);
      } catch {
        parsedValue = newConfig.value;
      }

      await updateConfigMutation.mutateAsync({
        key: newConfig.key,
        value: parsedValue,
        description: newConfig.description,
      });

      toast.success("配置已添加");
      setNewConfig({ key: "", value: "", description: "" });
      setShowNewForm(false);
      configsQuery.refetch();
    } catch (error) {
      toast.error("添加失败");
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">系统配置</h1>
          <Button
            onClick={() => setShowNewForm(!showNewForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            添加配置
          </Button>
        </div>

        {/* Add New Config Form */}
        {showNewForm && (
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle>添加新配置</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">配置键</label>
                <Input
                  value={newConfig.key}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="例如: paymentEnabled"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">配置值</label>
                <Input
                  value={newConfig.value}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, value: e.target.value }))}
                  placeholder='例如: true 或 {"enabled": true}'
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">描述</label>
                <Input
                  value={newConfig.description}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="配置说明"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddNew}
                  disabled={updateConfigMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  保存
                </Button>
                <Button
                  onClick={() => setShowNewForm(false)}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configs List */}
        <div className="space-y-4">
          {configsQuery.isLoading ? (
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground">加载中...</p>
              </CardContent>
            </Card>
          ) : configsQuery.data && configsQuery.data.length > 0 ? (
            configsQuery.data.map((config: any) => (
              <Card key={config.key} className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-6">
                  {editingKey === config.key ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">值</label>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">描述</label>
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleEditSave}
                          disabled={updateConfigMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          保存
                        </Button>
                        <Button
                          onClick={() => setEditingKey(null)}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{config.key}</h3>
                            <Badge className="bg-primary/20 text-primary border-primary/20">
                              {typeof config.value === "boolean" ? "布尔值" : "字符串"}
                            </Badge>
                          </div>
                          {config.description && (
                            <p className="text-sm text-muted-foreground mb-2">{config.description}</p>
                          )}
                          <div className="bg-background/50 rounded p-3 font-mono text-sm break-all">
                            {typeof config.value === "string"
                              ? config.value
                              : JSON.stringify(config.value)}
                          </div>
                          {config.updatedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              最后更新: {new Date(config.updatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(config.key, config.value, config.description)}
                          className="gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          编辑
                        </Button>
                        {!["paymentEnabled"].includes(config.key) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(config.key)}
                            className="gap-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">暂无配置</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
