import DashboardLayout from "@/components/DashboardLayout";
import AdvancedSearchAndRecommend from "@/components/AdvancedSearchAndRecommend";
import { mockDiscussionThreads } from "@/lib/mockCommunityData";

export default function Search() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">搜索与推荐</h1>
          <p className="text-muted-foreground">
            发现相关讨论、热门话题和个性化推荐
          </p>
        </section>

        <AdvancedSearchAndRecommend threads={mockDiscussionThreads} />
      </div>
    </DashboardLayout>
  );
}
