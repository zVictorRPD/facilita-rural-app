import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Hairline, Hint, NavBar, Screen, Section } from "@/components/ui";
import { useTheme } from "@/theme";

const medals = ["#C9A227", "#9AA3AE", "#B87333"];

export default function RankingScreen() {
  const { colors } = useTheme();
  const query = useQuery({ queryKey: ["ranking"], queryFn: () => api<{ total: number; courses: { name: string; count: number }[] }>("/ranking") });
  const courses = query.data?.courses ?? [];
  const max = courses[0]?.count || 1;
  return (
    <Screen>
      <NavBar title="Ranking de cursos" back="Mais" />
      <ScrollView>
        <Section first title={`${query.data?.total ?? 0} grades criadas`}>
          {courses.map((course, index) => (
            <Hairline key={course.name} first={index === 0}>
              <Text style={{ width: 28, fontWeight: "700", color: index < 3 ? medals[index] : colors.muted }}>{index + 1}º</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: index < 3 ? "600" : "500", color: colors.text }}>{course.name}</Text>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.track, marginTop: 5 }}>
                  <View style={{ width: `${(course.count / max) * 100}%`, height: 4, borderRadius: 2, backgroundColor: index < 3 ? medals[index] : colors.todo }} />
                </View>
              </View>
              <Text style={{ width: 40, textAlign: "right", color: colors.text2, fontSize: 12 }}>{course.count}</Text>
            </Hairline>
          ))}
        </Section>
        <Hint>Número de grades criadas no Facilita Rural, por curso.</Hint>
      </ScrollView>
    </Screen>
  );
}
